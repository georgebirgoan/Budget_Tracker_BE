import { Inject, Injectable } from '@nestjs/common';
import { REDIS } from '../redis/redis.module';
import { SessionData } from 'src/modules/auth/types/sessionInterface';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';


@Injectable()
export class SessionService {
  constructor(@Inject(REDIS) private readonly redis) {}


  
  private generateSessionId(): string {
    return randomBytes(32).toString("hex"); 
  }

  async createSession(sessionData: {
    deconectedAt:string,
    email:string,
    fullName:string,
    userId: number;
    userAgent: string;
    deviceName: string;
    role:Role
  }) {

    const sessionId = this.generateSessionId();
    console.log("sesionIddd:",sessionId)

    const payload :SessionData = {
      sessionId,
      deconectedAt:sessionData.deconectedAt,
      email:sessionData.email,
      fullName:sessionData.fullName,
      userId: sessionData.userId,
      userAgent: sessionData.userAgent,
      deviceName: sessionData.deviceName,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      role:sessionData.role
    };

    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(payload),
      { EX: 60 * 60 * 24 * 7 } // pe 7 zile
    );

    return sessionId;
  }

  async getSession(sessionId: number) {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: number) {
    await this.redis.del(`session:${sessionId}`);
  }
}

