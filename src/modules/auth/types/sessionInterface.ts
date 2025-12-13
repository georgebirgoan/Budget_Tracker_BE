import { Role } from "@prisma/client";


export interface SessionData {
  sessionId: string;
  email:string,
  fullName:string,
  userId: number;
  userAgent: string | null;
  deviceName: string | null;
  createdAt: string; 
  expiresAt: string;
  deconectedAt:string;
  role:Role
}
