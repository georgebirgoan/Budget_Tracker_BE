import { Inject, Injectable } from '@nestjs/common';
import { REDIS } from '../redis/redis.module';
import { SessionData } from 'src/modules/auth/types/sessionInterface';
import { Role, Session } from '@prisma/client';
import { randomBytes } from 'crypto';
import { tr } from 'zod/v4/locales';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(@Inject(REDIS) private readonly redis,
        private prisma:PrismaService,
    
) {}
  
 

  async createSession(sessionData: {
    userId:number,
    deviceName?:string,
    userAgent?:string,
    ip?:string
  }) {

    // const sessionId = this.generateSessionId();
      
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session  = await this.prisma.session.create({
      data:{
        userId:sessionData.userId,
        deviceName:sessionData.deviceName,
        userAgent:sessionData.userAgent,
        ip:sessionData.ip,
        expiresAt:expiresAt,
        refreshToken:""
      }
    })

  const sessionId = session.id;
    
  return sessionId;


  //pt rediss
    // await this.redis.set(
    //   `session:${sessionId}`,
    //   JSON.stringify(payload),
    //   { EX: 60 * 60 * 24 * 7 } // pe 7 zile
    // );

  }

  async getSession(sessionId: number) {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: number) {
    await this.redis.del(`session:${sessionId}`);
  }

  // async getSessionDB(sessionId:number){
  //   try{
  //     const sessFromDb = await this.prisma.session.findUnique({})
  //   }catch(err){

  //   }
  // }

  
}

