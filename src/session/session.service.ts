import { Inject, Injectable } from '@nestjs/common';
import { REDIS } from '../redis/redis.module';
import { SessionData } from 'src/modules/auth/types/sessionInterface';
import { Role } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(@Inject(REDIS) private readonly redis) {}

  async createSession(sessionData: {
    userId: number;
    ip: string;
    userAgent: string;
    deviceName: string;
    refreshTokenHash: string;
    role:Role
  }) {

    const sessionId = await this.redis.incr("session_counter");

    const payload :SessionData = {
      sessionId,
      userId: sessionData.userId,
      ip: sessionData.ip,
      userAgent: sessionData.userAgent,
      deviceName: sessionData.deviceName,
      refreshTokenHash: sessionData.refreshTokenHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
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

