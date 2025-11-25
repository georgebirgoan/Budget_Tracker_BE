import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../common/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request, Response } from 'express'
import { UserAuthService } from '../utils/user-service';
import { UserSessionService } from '../utils/session-service';
@Injectable()
export class LoginService {


  constructor(
    private prisma:PrismaService,
    private userAuthService:UserAuthService,
    private userSessionService:UserSessionService,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,
  ) {}


 

  async login(req: Request, userId: number, res: Response) {
    const user = await this.userAuthService.findUser(userId);

    
    const { accessToken, refreshToken } = await this.userAuthService.generateTokens({
      id: user.id,
      email: user.email,
      fullName: user.fullName ?? "",
      role: user.role
    });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      "undefined";

    const userAgent = req.headers['user-agent'] || "undefined user agent";
    const parsed = this.userAuthService.parseDevice(userAgent);
    const deviceName = `${parsed.deviceModel} · ${parsed.os} · ${parsed.browser}`;

    const session =await this.userSessionService.createDeviceSession({
      userId:user.id,
      refreshToken:refreshTokenHash,
      ip,
      userAgent,
      deviceName
    });


    await this.userAuthService.saveAccesToken(res,accessToken);
    await this.userAuthService.saveRefreshToken(res,refreshToken);
    await this.userAuthService.saveSessionId(res,session.id);
    
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }




  async getSessionFromTokens(req: Request, res: Response) {
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  //
  // 1. If access token exists → try verifying it
  //
  if (accessToken) {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: this.jwtCfg.secret,
      });

      const user = await this.userAuthService.findUser(payload.sub);

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (err) {
      // Access token is expired or invalid → go to refresh logic
    }
  }

  //
  // 2. If access token missing OR invalid → try refresh token (BIG APP BEHAVIOUR)
  //
  if (!refreshToken) {
    throw new UnauthorizedException("No refresh token → go to login");
  }

  const tokens = await this.userAuthService.refreshTokensFromValue(refreshToken);

  // Rotate cookies (new tokens)
  res.cookie("access_token", tokens.accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  res.cookie("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  return {
    user: {
      id: tokens.user.id,
      email: tokens.user.email,
      fullName: tokens.user.fullName,
      role: tokens.user.role,
    },
  };
}





  async signOut(userId: number) {
  await this.prisma.session.deleteMany({
    where: { userId },
  });

  return true;
}
}
