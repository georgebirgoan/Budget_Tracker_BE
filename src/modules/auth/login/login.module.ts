// import { Module } from '@nestjs/common';
// import { LoginService } from './login.service';
// import { LoginController } from '../login/login.controller';
// import { RegisterService } from 'src/modules/auth/register/register.service';
// import { LocalStrategy } from '../common/strategies/local.strategy';
// import { JwtStrategy } from '../common/strategies/jwt.strategy';
// import { RefreshJwtStrategy } from '../common/strategies/refresh.strategy';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from '../common/guards/roles/roles.guard';
// import { AuthModule } from '../auth.module';

// @Module({
//   imports: [
//      AuthModule
//    ],
//   controllers: [LoginController],
//   providers: [
//     LoginService,
//     RegisterService,
//     LocalStrategy,
//     JwtStrategy,
//     RefreshJwtStrategy,
//     {
//       provide: APP_GUARD,
//       useClass: RolesGuard,
//     },
//   ],
// })

// export class LoginModule {}
