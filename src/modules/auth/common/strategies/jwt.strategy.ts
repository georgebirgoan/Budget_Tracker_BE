import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from 'src/modules/auth/types/auth-jwtPayload';
import { Inject, Injectable } from '@nestjs/common';
import { LoginService } from '../../login/login.service';
import { createSecretKey } from 'crypto';
import { ignoreElements } from 'rxjs';

//VALIDATE BEARER TOKEN 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY) private jwtCfg: ConfigType<typeof jwtConfig>,
    private authService: LoginService,
  ) {
    super({
     jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(), //  mobile/Postman
      (req) => req?.cookies?.access_token ?? null, //  web cookie
]),
      secretOrKey:jwtCfg.secret,
       ignoreExpiration:false
  });
}

  validate(payload: AuthJwtPayload) {
  return {
    id: payload.sub,
    email:payload.email,
    fullName:payload.fullName,
    role:payload.role,
    sessionId:payload.sessionId
  };
}
}

