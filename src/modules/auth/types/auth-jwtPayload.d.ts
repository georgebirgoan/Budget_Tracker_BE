import { Role } from "@prisma/client";

export type AuthJwtPayload = {
  sub: number;
  email:string,
  fullName:string | "",
  role:Role
  sessionId:number
};
