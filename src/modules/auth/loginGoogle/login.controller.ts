// import {
//   Controller,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Post,
//   Req,
//   Res,
//   UseGuards,
// } from '@nestjs/common';
// import { AuthService } from './login.service';
// import { LocalAuthGuard } from '../common/guards/local-auth/local-auth.guard';
// import { RefreshAuthGuard } from '../common/guards/refresh-auth/refresh-auth.guard';
// import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
// import { Public } from '../common/decorators/public.decorator';
// import { GoogleAuthGuard } from '../common/guards/google-auth/google-auth.guard';
// import { LoginUserDto } from '../dto/login.dto';
// import { Body } from '@nestjs/common/decorators';
// import {Session ,AllowAnonymous,OptionalAuth} from '@thallesp/nestjs-better-auth';
// import type { UserSession } from '@thallesp/nestjs-better-auth';


// @Controller('auth')
// export class AuthController {
//   constructor(
//     private authService: AuthService,
//   ) {}

//   @Public()
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(LocalAuthGuard)


//     @Get('me')
//   async getProfile(@Session() session: UserSession) {
//     return { user: session.user };
//   }
//   @Get('public')
//   @AllowAnonymous() // Allow anonymous access
//   async getPublic() {
//     return { message: 'Public route' };
//   }
//   @Get('optional')
//   @OptionalAuth() // Authentication is optional
//   async getOptional(@Session() session: UserSession) {
//     return { authenticated: !!session };
//   }
  



// }
