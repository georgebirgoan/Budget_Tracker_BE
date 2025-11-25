import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from './common/config/jwt.config';
import refreshJwtConfig from './common/config/refresh-jwt.config';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { RefreshJwtStrategy } from './common/strategies/refresh.strategy';
import { LocalStrategy } from './common/strategies/local.strategy';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import googleOauthConfig from './common/config/google-oauth.config';
import { LoginController } from './login/login.controller';
import { RegisterController } from './register/register.controller';
import { LoginService } from './login/login.service';
import { RegisterService } from './register/register.service';
import { UserAuthService } from './utils/user-service';
import { UserSessionService } from './utils/session-service';


@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
        useFactory: (jwtCfg: ConfigType<typeof jwtConfig>) => ({ secret: jwtCfg.secret, signOptions: { expiresIn: jwtCfg.expiresIn as JwtSignOptions['expiresIn'] }, }),
        }),
  ],
  controllers: [
    LoginController,
    RegisterController,
  ],
  providers: [
    LoginService,
    RegisterService,
    JwtStrategy,
    RefreshJwtStrategy,
    LocalStrategy,
    UserAuthService,
    UserSessionService
  ],
  exports: [JwtModule],
})
export class AuthModule {}
