import { AuthUser } from "../login/type/login.type";
declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      user: User ;
    }
  }
}

export {};
