import { Session } from '@thallesp/nestjs-better-auth';
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
import { Request, Response } from 'express'
import { Role, User } from '@prisma/client';

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




async refreshTokensFromValue(refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.refreshCfg.secret,
    });

    const userId = payload.sub;
    const session = await this.prisma.session.findFirst({
      where:{userId:userId}
    })
      
    if(!session){
      throw new UnauthorizedException("Nu exista sesiune activa pentru user!");
    }

    const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isValid) {
        throw new UnauthorizedException("Refresh token does not match stored value");
      }
      const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const tokens = await this.generateTokens(user);
    
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
        updatedAt: new Date(),
      }
    });

    return tokens;

  } catch (err) {
    throw new UnauthorizedException("Invalid refresh token");
  }
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
public async generateTokens(
  user: {
  id: number;
  email: string;
  fullName: string | null;
  role: Role;
  }) {
  const payload: AuthJwtPayload = {
  sub: user.id,
    email: user.email,
    fullName: user.fullName ?? "",
    role: user.role,
  };

  const accessToken = await this.jwtService.signAsync(payload, {
    secret: this.jwtCfg.secret,
    expiresIn: this.jwtCfg.expiresIn as any,  // MUST be string or number
  });

  const refreshToken = await this.jwtService.signAsync(payload, {
    secret: this.refreshCfg.secret,
    expiresIn: this.refreshCfg.expiresIn as any,
  });
  console.log("user din generate:",user);
  return { accessToken, refreshToken, user };
}



  /**  3. Login user */
  // async login(req:Request,userId: number) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId, },
  //   });

  //   if (!user) throw new Error('User not found!!');

  //   const { accessToken, refreshToken } = await this.generateTokens(
  //     user.id,
  //     user.email,
  //     user.fullName || '',
  //     user.role
  //   );

  //   const refreshTokenHash = await bcrypt.hash(refreshToken,10);

  //    const ipAddress =
  //   req.headers['x-forwarded-for']?.toString() ||
  //   req.socket.remoteAddress ||
  //   null;

  //   const userAgent = req.headers['user-agent'] || null;
  //   const deviceName = this.extractDeviceName(userAgent);

  //   const session = await this.prisma.session.create({
  //   data: {
  //     userId: user.id,
  //     refreshToken: refreshTokenHash,
  //     ipAddress,
  //     userAgent,
  //     deviceName,
  //     expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 zile
  //   },
  // });

  // //set cookie in backend 
  // res.cookies.set({
  //   name: "access_token",
  //   value: accessToken,
  //   httpOnly: true,
  //   secure: false,     // true in production with HTTPS
  //   sameSite: "lax",
  //   path: "/",
  //   maxAge: 60 * 60 * 24, // 1 day
  // });


  //   return {
  //   user: {
  //     id: user.id,
  //     email: user.email,
  //     fullName: user.fullName,
  //   },
  //   tokens: {
  //     accessToken,
  //     refreshToken: refreshToken, 
  //   },
  //   session: {
  //     id: session.id,
  //     ipAddress: session.ipAddress,
  //     userAgent: session.userAgent,
  //     deviceName: session.deviceName,
  //     expiresAt: session.expiresAt,
  //   },
  // };
  // }

async login(req: Request, userId: number, res: Response) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error('User not found!');

  // Generate tokens
  const { accessToken, refreshToken } = await this.generateTokens({
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? "",
    role: user.role
  });

  // Hash refresh token
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const ipAddress =
    req.headers['x-forwarded-for']?.toString() ||
    req.socket.remoteAddress ||
    null;

  const userAgent = req.headers['user-agent'] || null;

  // Create session
  await this.prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: refreshTokenHash, 
      ipAddress,
      userAgent,
      deviceName: this.extractDeviceName(userAgent),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('acces token',accessToken);
  console.log('refresh token',refreshToken);


  // Set access token cookie
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  // Set refresh token cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

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


  try {
    // 1. Validate access token (signature + expiration)
    const payload = this.jwtService.verify(accessToken, {
      secret: this.jwtCfg.secret,
    });

    // 2. Load the user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    console.log("user cand are acces token:",user);
  return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
    };

  } catch (err) {
    // 3. If access token invalid or expired → try refresh
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token → go to login");
    }

    // 4. Refresh flow (generates new access + refresh tokens)
    const tokens = await this.refreshTokensFromValue(refreshToken);
    
    if(tokens.user == undefined){
      throw new Error("Eroare tokennnnnnnnnn");
    }
    // 5. Rotating new cookies
    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      sameSite: "strict",
    });

    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });
   
     return {
      user: {
        id: tokens.user.id,
        email: tokens.user.email,
        fullName: tokens.user.fullName,
        role: tokens.user.role
      }
    };
  }
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



  async signOut(userId: number) {
  await this.prisma.session.deleteMany({
    where: { userId },
  });

  return true;
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
