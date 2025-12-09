import { Role } from "@prisma/client";


export interface SessionData {
  sessionId: string;
  userId: number;
  ip: string | null;
  userAgent: string | null;
  deviceName: string | null;
  refreshTokenHash: string | null;
  createdAt: number; 
  expiresAt: number;
  role:Role
}
