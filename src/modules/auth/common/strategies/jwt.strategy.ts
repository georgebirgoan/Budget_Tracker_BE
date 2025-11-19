import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from 'src/modules/auth/common/types/auth-jwtPayload';
import { Inject, Injectable } from '@nestjs/common';
import { LoginService } from '../../login/login.service';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY) private jwtCfg: ConfigType<typeof jwtConfig>,
    private authService: LoginService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
     
     jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token,   
      ]),
        
      secretOrKey: jwtCfg.secret,
    });
  }
  validate(payload: AuthJwtPayload) {
  return {
    id: payload.sub,
    email:payload.email,
    fullName:payload.fullName,
    role:Role
  };
}
}

