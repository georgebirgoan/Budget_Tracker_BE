import { Injectable, NotFoundException,Inject,UnauthorizedException} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service"
import {Request,Response} from 'express';
import { modeSameSite } from "src/utils/constants";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from '../common/config/jwt.config';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from "@prisma/client";
import { AuthJwtPayload } from "../common/types/auth-jwtPayload";
import { RegisterService } from "../register/register.service";
import { CurrentUser } from 'src/modules/auth/common/types/current-user';

@Injectable()
export class UserAuthService{
    constructor(
        private prisma:PrismaService,
        private readonly jwtService: JwtService,
        private readonly userService: RegisterService,
        
        @Inject(jwtConfig.KEY)
        private readonly jwtCfg: ConfigType<typeof jwtConfig>,

        @Inject(refreshJwtConfig.KEY)
        private readonly refreshCfg: ConfigType<typeof refreshJwtConfig>


    ){}



   async findUser(id:number){
        const user =await this.prisma.user.findUnique({
            where:{id}
        })

        if(!user) {
            throw new NotFoundException("Nu s-a putut gasit userul!");
        }
    return user;
    }

   

    async saveAccesToken(res:Response,access_token:string){
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: modeSameSite == "PROD" ? true : false,
            sameSite: modeSameSite == "PROD" ? "none" :"lax",
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
          });
    }

    async saveRefreshToken(res:Response,refreshToken:string){
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: modeSameSite == "PROD" ? true : false,
                sameSite: modeSameSite == "PROD" ? "none" :"lax" ,
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000, //7d
            });
        }
       
        async saveSessionId(res:Response,id:number){
                console.log("modeSameSite save session:",modeSameSite);
                res.cookie('session_id', id, {
                    httpOnly: true,
                    secure: modeSameSite == "PROD" ? true : false,
                    sameSite: modeSameSite == "PROD" ? "none" :"lax",
                    path: '/',
                });
            }


    // async refreshTokensFromValue(refreshToken: string) {
    // try {
    //     const payload = this.jwtService.verify(refreshToken, {
    //     secret: this.refreshCfg.secret,
    //     });
    
    //     const userId = payload.sub;
    //     const session = await this.prisma.session.findFirst({
    //     where:{userId:userId}
    //     })
        
    //     if(!session){
    //     throw new UnauthorizedException("Nu exista sesiune activa pentru user!");
    //     }
    
    //     const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
    //     if (!isValid) {
    //         throw new UnauthorizedException("Refresh token does not match stored value");
    //     }
    //     const user = await this.findUser(userId);
    //     const tokens = await this.generateTokens(user);
        
    //     if(!tokens){
    //         throw new NotFoundException("Nu s-a generat tokenul pentru user!");
    //     }

    //     await this.prisma.session.update({
    //         where: { id: session.id },
    //         data: {
    //             refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
    //             updatedAt: new Date(),
    //         }
    //         });
    
    //     return tokens;
    // } catch (err) {
    //     throw new UnauthorizedException("Invalid refresh token");
    // }
    // }
    async refreshTokensFromValue(refreshToken: string) {
        let payload: any;

  // 1. Verify refresh JWT (signature + expiration)
  try {
    payload = this.jwtService.verify(refreshToken, {
      secret: this.refreshCfg.secret, // ✅ use refreshCfg.secret
    });
  } catch (err) {
    throw new UnauthorizedException("Invalid or expired refresh token");
  }

  const userId = payload.sub;
  if (!userId) {
    throw new UnauthorizedException("Invalid refresh token payload");
  }

  // 2. Load ALL active sessions for this user (multi-device support)
  const sessions = await this.prisma.session.findMany({
    where: {
      userId,
      revoked: false,
      expiresAt: { gt: new Date() }, // ✅ ignore expired sessions
    },
  });

  if (!sessions.length) {
    throw new UnauthorizedException("Nu exista sesiune activa pentru user!");
  }

  // 3. Find which session matches this refresh token (hash compare)
  let matchedSession: (typeof sessions)[number] | null = null;

  for (const session of sessions) {
    const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (isValid) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) {
    // Optional: here you could revoke all sessions for safety
    throw new UnauthorizedException("Refresh token does not match any active session");
  }

  // 4. Load user
  const user = await this.findUser(userId);

  // 5. Generate new tokens (rotation)
  const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
    user,
  );

  // 6. Update ONLY this session (this device) with new refresh token hash
  await this.prisma.session.update({
    where: { id: matchedSession.id },
    data: {
      refreshToken: await bcrypt.hash(newRefreshToken, 10),
      updatedAt: new Date(),
    },
  });

  // 7. Return tokens + user
  return { accessToken, refreshToken: newRefreshToken, user };
}


    async generateTokens(
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
            expiresIn: this.jwtCfg.expiresIn as any,
        });
        
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.refreshCfg.secret,
            expiresIn: this.refreshCfg.expiresIn as any,
        });
        console.log("user din generate:",user);
        return { accessToken, refreshToken, user };
        }
    
    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
        where:{email}
        });

        if (!user) throw new UnauthorizedException('User not found');
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Password  is not matching!');

        return user;
}

    // async validateRefreshToken(refreshToken: string) {
    //     try {
    //             const payload = await this.jwtService.verifyAsync(refreshToken, {
    //             secret: this.refreshCfg.secret,
    //             });
        
    //             const userId = payload.sub;
    //             if (!userId) throw new UnauthorizedException('Invalid refresh token payload');
        
    //             const user = await this.findUser(userId);
        
    //             const isMatch = await bcrypt.compare(refreshToken);
    //             if (!isMatch) throw new UnauthorizedException('Invalid refresh token,is not matching!');
        
    //         return user;
    //     } catch (err) {
    //         throw new UnauthorizedException('Invalid or expired refresh token');
    //     }
    //     }


    async validateJwtUser(userId: number) {
        const user = await this.userService.findOne(userId);
        if (!user) throw new UnauthorizedException('User not found!');
        const currentUser: CurrentUser = { id: user.id };
        return currentUser;
    }

     
    
     parseDevice(userAgent: string | null) {
        if (!userAgent) {
            return {
            deviceType: "unknown",
            deviceModel: "Unknown",
            brand: "Unknown",
            os: "Unknown",
            browser: "Unknown",
            isMobile: false,
            };
        }

        const ua = userAgent.toLowerCase();

        // ─────────────────────────────
        // BROWSER DETECTION
        // ─────────────────────────────
        let browser = "Unknown";

        if (ua.includes("crios")) browser = "Chrome (iOS)";
        else if (ua.includes("fxios")) browser = "Firefox (iOS)";
        else if (ua.includes("edgios")) browser = "Edge (iOS)";
        else if (ua.includes("chrome")) browser = "Chrome";
        else if (ua.includes("safari")) browser = "Safari";
        else if (ua.includes("firefox")) browser = "Firefox";
        else if (ua.includes("edg")) browser = "Edge";

        // ─────────────────────────────
        // OS DETECTION
        // ─────────────────────────────
        let os = "Unknown OS";
        let osVersion = "";

        // iOS / iPhone
        if (ua.includes("iphone") || ua.includes("ipad")) {
            os = "iOS";
            const match = userAgent.match(/OS (\d+[_\.\d]*)/i);
            osVersion = match ? match[1].replace(/_/g, ".") : "";
        }

        // macOS
        if (ua.includes("macintosh")) {
            os = "macOS";
            const match = userAgent.match(/Mac OS X (\d+[._]\d+([._]\d+)?)/i);
            osVersion = match ? match[1].replace(/_/g, ".") : "";
        }

        // Android
        if (ua.includes("android")) {
            os = "Android";
            const match = userAgent.match(/Android (\d+(\.\d+)?)/i);
            osVersion = match ? match[1] : "";
        }

        // Windows
        if (ua.includes("windows")) {
            os = "Windows";
            const match = userAgent.match(/Windows NT (\d+\.\d+)/i);
            osVersion = match ? match[1] : "";
        }

        // Linux
        if (ua.includes("linux") && !ua.includes("android")) {
            os = "Linux";
        }

        // ─────────────────────────────
        // DEVICE TYPE
        // ─────────────────────────────
        let deviceType: "phone" | "tablet" | "desktop" | "unknown" = "unknown";

        if (ua.includes("iphone")) deviceType = "phone";
        else if (ua.includes("ipad") || ua.includes("tablet")) deviceType = "tablet";
        else if (ua.includes("android") && ua.includes("mobile")) deviceType = "phone";
        else if (ua.includes("android")) deviceType = "tablet";
        else if (ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux"))
            deviceType = "desktop";

        // ─────────────────────────────
        // DEVICE BRAND / MODEL
        // ─────────────────────────────
        let deviceModel = "Unknown";
        let brand = "Unknown";

        // Apple
        if (ua.includes("iphone")) {
            brand = "Apple";
            deviceModel = "iPhone";
        }
        if (ua.includes("ipad")) {
            brand = "Apple";
            deviceModel = "iPad";
        }
        if (ua.includes("macintosh")) {
            brand = "Apple";
            deviceModel = "Mac";
        }

        // Samsung
        if (ua.includes("samsung") || ua.includes("sm-")) {
            brand = "Samsung";
            deviceModel = "Samsung Device";
        }

        // Xiaomi
        if (ua.includes("xiaomi") || ua.includes("mi ")) {
            brand = "Xiaomi";
            deviceModel = "Xiaomi Device";
        }

        // Huawei
        if (ua.includes("huawei")) {
            brand = "Huawei";
            deviceModel = "Huawei Device";
        }

        // Generic Android
        if (brand === "Unknown" && ua.includes("android")) {
            brand = "Android";
            deviceModel = "Android Device";
        }

        return {
            deviceType,
            deviceModel,
            brand,
            os: osVersion ? `${os} ${osVersion}` : os,
            browser,
            isMobile: deviceType === "phone",
        };
        }


    

}