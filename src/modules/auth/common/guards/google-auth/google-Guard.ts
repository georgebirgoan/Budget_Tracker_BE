// src/modules/auth/guards/google.guard.ts
import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    // pass state (redirectUri) into Google auth request
    const state = (req.query["state"] as string) || undefined;
    return {
      scope: ["profile", "email"],
      state,              // will come back on callback as req.query.state
      prompt: "select_account",
    };
  }
}
