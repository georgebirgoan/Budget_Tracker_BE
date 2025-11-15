import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterService } from 'src/modules/auth/register/register.service';
import { AuthJwtPayload } from 'src/modules/auth/common/types/auth-jwtPayload';
import jwtConfig from '../common/config/jwt.config';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CurrentUser } from 'src/modules/auth/common/types/current-user';
import { CreateUserDto } from 'src/modules/auth/dto/register.dto.';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express'
import { LoginUserDto } from '../dto/login.dto';

@Injectable()
export class LoginService {
  constructor(
    private prisma:PrismaService,
    private readonly userService: RegisterService,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshCfg: ConfigType<typeof refreshJwtConfig>,
  ) {}

  extractDeviceName(userAgent: string | null): string {
  if (!userAgent) return "Unknown Device";

  const ua = userAgent.toLowerCase();
  console.log("ua:",ua);

  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) return "Android Device";

  if (ua.includes("windows")) return "Windows PC";
  if (ua.includes("macintosh") || ua.includes("mac os")) return "Mac";
  if (ua.includes("linux")) return "Linux PC";

  if (ua.includes("chrome")) return "Chrome Browser";
  if (ua.includes("firefox")) return "Firefox Browser";
  if (ua.includes("safari")) return "Safari Browser";
  if (ua.includes("edge")) return "Microsoft Edge";

  return "Unknown Device";
}


  /** 1. Validate email + password */
  async validateUser(email: string, password: string) {
    console.log("email validare",email);
    const user = await this.prisma.user.findUnique({
      where:{email}
    });

    console.log("ajunge in validare user");
    if (!user) throw new UnauthorizedException('User not found');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Password  is not matching!');

    return user;
  }

  /** 2. Generate both access & refresh tokens */
  private async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtCfg.secret,
      expiresIn: this.jwtCfg.expiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshCfg.secret,
      expiresIn: this.refreshCfg.expiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  /**  3. Login user */
  async login(req:Request,userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, },
    });

    if (!user) throw new Error('User not found!!');

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken,10);

     const ipAddress =
    req.headers['x-forwarded-for']?.toString() ||
    req.socket.remoteAddress ||
    null;

    const userAgent = req.headers['user-agent'] || null;
    const deviceName = this.extractDeviceName(userAgent);

    const session = await this.prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: refreshTokenHash,
      ipAddress,
      userAgent,
      deviceName,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 zile
    },
  });

    return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    tokens: {
      accessToken,
      refreshToken: refreshToken, 
    },
    session: {
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceName: session.deviceName,
      expiresAt: session.expiresAt,
    },
  };
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshCfg.secret,
      });

      const userId = payload.sub;
      if (!userId) throw new UnauthorizedException('Invalid refresh token payload');

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('No refresh token stored');
      }

      const isMatch = await bcrypt.compare(refreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      return user;
    } catch (err) {
      console.error(' Refresh token validation failed:', err.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async refreshTokens(token:string) {
      const user = await this.validateRefreshToken(token);
      if (!user) throw new UnauthorizedException();

      const { accessToken, refreshToken } = await this.generateTokens(user.id);

      return { accessToken, refreshToken };
  }


  /**5. Logout user */
  async signOut(userId: number) {
    //await this.userService.updateHashedRefreshToken(userId, '');
  }


  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id };
    return currentUser;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (user) return user;
    return this.userService.create(googleUser);
  }
}
