import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../../types/auth-jwtPayload';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { Request } from 'express';
import { LoginService } from '../../login/login.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refrshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private  loginService: LoginService,
  ) {
   super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token,
      ]),
      secretOrKey: refrshJwtConfiguration.secret,
      passReqToCallback: true,
    });

  }


// async validate(req: Request, payload: AuthJwtPayload) {
//   const refreshToken = req.cookies?.refresh_token;

//   if (!refreshToken) {
//     throw new UnauthorizedException("Missing refresh token");
//   }

//   const user = await this.loginService.validateRefreshToken(payload.sub);

//   return user; 
// }


}
