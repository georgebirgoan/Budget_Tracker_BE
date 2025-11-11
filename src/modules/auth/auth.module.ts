import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from './common/config/jwt.config';
import refreshJwtConfig from './common/config/refresh-jwt.config';
import { LoginService } from './login/login.service';
import { LoginController } from './login/login.controller';
import { RegisterService } from './register/register.service';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { RefreshJwtStrategy } from './common/strategies/refresh.strategy';
import { LocalStrategy } from './common/strategies/local.strategy';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import googleOauthConfig from './common/config/google-oauth.config';
import { RegisterController } from './register/register.controller';
@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (jwtCfg: ConfigType<typeof jwtConfig>) => ({
        secret: jwtCfg.secret,
        signOptions: { expiresIn: jwtCfg.expiresIn as JwtSignOptions['expiresIn'] },
      }),
    }),
  ],
  controllers: [LoginController,RegisterController],
  providers: [
    LoginService,
    RegisterService,
    JwtStrategy,
    RefreshJwtStrategy,
    LocalStrategy,
  ],
  exports: [
    ConfigModule,
    JwtModule,

],
})
export class AuthModule {}
