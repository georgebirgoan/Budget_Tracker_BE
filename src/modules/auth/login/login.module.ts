import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from '../login/login.controller';
import { RegisterService } from 'src/modules/auth/register/register.service';
import { User } from 'src/entities/user.entity';
import { LocalStrategy } from '../common/strategies/local.strategy';
import jwtConfig from '../common/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import { RefreshJwtStrategy } from '../common/strategies/refresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import googleOauthConfig from '../common/config/google-oauth.config';
import { AuthModule } from '../auth.module';

@Module({
  imports: [
    AuthModule
   ],
  controllers: [LoginController],
  providers: [
    LoginService,
    RegisterService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    //GoogleStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard, //@UseGuards(JwtAuthGuard) applied on all API endppints
    // },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class LoginModule {}
