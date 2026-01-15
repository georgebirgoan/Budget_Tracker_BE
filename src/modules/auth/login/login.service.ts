import { SessionUserType } from './../types/sessionType';
import { Role } from '@prisma/client';
import {  Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../common/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { Request, Response } from 'express'
import { UserAuthService } from '../utils/user-service';
import { SessionData } from '../types/sessionInterface';
import { LoginUserDto } from '../dto/login.dto';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import {mode} from 'src/utils/constants'
import { SessionService } from 'src/session/session.service';

@Injectable()
export class LoginService {

/*
1.Create sesion
2.generate acces token/refresh
3.hash refresh
4.update sesion with refresh token hash
5.set cookie
*/ 



  constructor(
    private prisma:PrismaService,
    private userAuthService:UserAuthService,
    private sessionService:SessionService,
    private readonly jwtService: JwtService,
  @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,
    
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshCfg: ConfigType<typeof refreshJwtConfig>
  ) {}
  




  async checkSignature(refreshToken:string):Promise<{sub:number;sessionId:number}>{
  {
    try {
      const payload = await this.jwtService.verifyAsync<{sub:number,sessionId:number}>
      (
        refreshToken, 
        {
        secret: this.refreshCfg.secret,
      });
      return payload;
    } catch(e:any) {
      throw new UnauthorizedException('Invalid/expired refresh token');
    }
  }
}
  



async setNewTokens(session:SessionUserType){
   const accessPayload = {
      sub: session.user.id,
      sessionId: session.id,
      email: session.user.email,
      fullName: session.user.fullName ?? '',
      role: session.user.role,
    };

  const newAccessToken = await this.jwtService.signAsync(accessPayload, {
    secret: this.jwtCfg.secret,
    expiresIn: this.jwtCfg.expiresIn as any,
  });

  const newRefreshToken = await this.jwtService.signAsync(
    { sub: session.user.id, sessionId: session.id },
    { secret: this.refreshCfg.secret, expiresIn: this.refreshCfg.expiresIn as any },
  );
  return {newAccessToken,newRefreshToken}
}



async setInCookie(res:Response,newAccessToken:string,newRefreshToken:string){
        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: mode == "PROD" ? true : false,
            sameSite: mode == "PROD" ? "none" :"lax",
            path: '/',
            maxAge: 15 * 60 *  1000, //15min
          });
    

            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: mode == "PROD" ? true : false,
                sameSite: mode == "PROD" ? "none" :"lax" ,
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000, //7d

            });
}

  async findSessionActive(sessionId:number,userId:number):Promise<SessionUserType | null>{
      const session = await this.prisma.session.findFirst({
          where: {
            id: sessionId,
            userId,
            revoked: false,
            expiresAt: { gt: new Date() },
          },
          select: {
            id: true,
            refreshToken: true,
            user: {
               select:
                { id: true, email: true, fullName: true, role: true } },
          },
        });
        return session;
  }

  async login(dto:LoginUserDto, res: Response,req:Request) {
    if(!dto.email || !dto.password){
      throw new NotFoundException("Email-ul sau parola nu exista!");
    }
    const user  = await this.userAuthService.validateUser(dto.email,dto.password)
    if(!user){
      throw new NotFoundException("Utilizatorul curent nu exista!");
    }

    const ip =
    req.headers['x-forwarded-for']?.toString() ||
    req.socket.remoteAddress ||
    "undefined";

    const userAgent = req.headers['user-agent'] || "undefined user agent";
    const parsed = this.userAuthService.parseDevice(userAgent);
    const deviceName = `${parsed.deviceModel} · ${parsed.os} · ${parsed.browser}`;
    
    const userId = user.id;
    let sessionId =0;
      try {
      sessionId = await this.sessionService.createSession({
          userId,
          deviceName,
          ip,
          userAgent
        });
      } catch (err) {
        throw new InternalServerErrorException("Eroare la crearea sesiuni pentru utlizator!");
      }


    const { accessToken, refreshTokenHash,refreshToken } = await this.userAuthService.generateTokens({
      id: user.id,
      email: user.email,
      fullName: user.fullName ?? "",
      role: user.role,
      sessionId:sessionId
    });
  
    if(!accessToken || !refreshTokenHash){
      throw new UnauthorizedException("Access/Refresh token nu exista!");
    }
    console.log("USER ID IN LOGINl:",user.id)
    console.log("session ID IN LOGINl:",sessionId)
    await this.userAuthService.updateRefreshToken(sessionId,refreshTokenHash);

    await this.userAuthService.saveAccesToken(res,accessToken);
    await this.userAuthService.saveRefreshToken(res,refreshToken);

   
    return {
      message: 'Logare cu succes!',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }


// async getAllSessions() {
//   const keys = await this.redis.keys("session:*");

//   const sessions :SessionData[] =[];

//   for (const key of keys) {
//     const data = await this.redis.get(key);
//       console.log("data sessions",data);
//     if (data) {
//       sessions.push(JSON.parse(data));
//     }
//   }

//   return sessions;
// }



/*async getSession(sessionId: string): Promise<SessionData> {
  if (!sessionId) {
    throw new UnauthorizedException("Nu exista sesiune ID pentru utlizatorul curent!");
  }
  const data = await this.redis.get(`session:${sessionId}`);
  // const data = await this.sessionService.
  console.log("data session",data);

  if (!data) {
    throw new NotFoundException("Nu s-a putut gasi sesiune pentru id-ul dat!");
  }

  return JSON.parse(data) as SessionData;
}*/


async getSessionUser(userId:number,sessionId:number){


    const session = await this.prisma.session.findFirst({
      where:{
        id:sessionId,
        userId:userId,
        revoked:false,
        expiresAt:{gt:new Date()}
      },
      select:{
        id:true,
        userId:true,
        deviceName:true,
        userAgent:true,
        ip:true,
        createdAt:true,
        updatedAt:true,
        expiresAt:true,
        revoked:true,
      }
    })

    if(!session){
      throw new UnauthorizedException("Nu exista sesiune valida pentru dvs!");
    }
return session;
}


async getLastDeconectedAt(userId:any){
 const lastDeconected= await this.prisma.session.findFirst({
      where:{
          userId,
          deconectedAt:{
            not:null
          }
    },
    orderBy:{deconectedAt:'desc'}
    })
  return lastDeconected;
}






//   async getSessionFromTokens(req: Request, res: Response) {
//   const accessToken = req.cookies?.access_token;
//   const refreshToken = req.cookies?.refresh_token;

//   //
//   // 1. If access token exists → try verifying it
//   //
//   if (accessToken) {
//     try {
//       const payload = this.jwtService.verify(accessToken, {
//         secret: this.jwtCfg.secret,
//       });

//       const user = await this.userAuthService.findUser(payload.sub);

//       return {
//         user: {
//           id: user.id,
//           email: user.email,
//           fullName: user.fullName,
//           role: user.role,
//         },
//       };
//     } catch (err) {
     
//     }
//   }

//   if (!refreshToken) {
//     throw new UnauthorizedException("No refresh token → go to login");
//   }

//   const tokens = await this.userAuthService.refreshTokensFromValue(refreshToken);

//   // Rotate cookies (new tokens)
//   res.cookie("access_token", tokens.accessToken, {
//     httpOnly: true,
//     sameSite: "strict",
//     secure: true,
//   });

//   res.cookie("refresh_token", tokens.refreshToken, {
//     httpOnly: true,
//     sameSite: "strict",
//     secure: true,
//   });

//   return {
//     user: {
//       id: tokens.user.id,
//       email: tokens.user.email,
//       fullName: tokens.user.fullName,
//       role: tokens.user.role,
//     },
//   };
// }



}
