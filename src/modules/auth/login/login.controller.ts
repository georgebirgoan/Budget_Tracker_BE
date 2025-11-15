import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { LocalAuthGuard } from '../common/guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from '../common/guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { GoogleAuthGuard } from '../common/guards/google-auth/google-auth.guard';
import { LoginUserDto } from '../dto/login.dto';
import { Body } from '@nestjs/common/decorators';
import {Session ,AllowAnonymous,OptionalAuth} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ApiOperation,ApiResponse } from '@nestjs/swagger';


@Controller('auth')
export class LoginController {
  constructor(
    private LoginService: LoginService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)


    @Get('me')
  async getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }
  @Get('public')
  @AllowAnonymous() // Allow anonymous access
  async getPublic() {
    return { message: 'Public route' };
  }
  @Get('optional')
  @OptionalAuth() // Authentication is optional
  async getOptional(@Session() session: UserSession) {
    return { authenticated: !!session };
  }
  

  @UseGuards(LocalAuthGuard)
  @Post('login')
    @ApiOperation({summary:"User login"})
    @ApiResponse({status:200,description:"User succes login"})
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    create(@Req() req) {
      return this.LoginService.login(req,req.user.id);
    }
 
  

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.LoginService.refreshTokens(req.user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOut(@Req() req) {
    this.LoginService.signOut(req.user.id);
  }

@Get('google/login')
@UseGuards(GoogleAuthGuard)
async googleLogin() {}

 /*doar web*/
// @UseGuards(GoogleAuthGuard)
// @Get('google/callback')
// async googleCallback(@Req() req,@Res() res) {
//   console.log('✅ Entered AuthController.googleCallback()',req.user);
//   const response = await this.LoginService.login(req.user.id);

//   return res.redirect(`http://localhost:8081/auth/callback?token=${response.accessToken}`);
// }

// @UseGuards(GoogleAuthGuard)
// @Get('google/callback')
// async googleCallback(@Req() req, @Res() res,loginDto:LoginUserDto) {
//   try {
//     // ⚙️ Hardcoded mobile deep link (your LAN IP)
//     const redirectUri = 'exp://172.20.10.9:8081/--/auth/callback';

//     const tokens = await this.authService.login(req.user.id,loginDto);

//     console.log('✅ Google OAuth successful for user:', req.user.email);
//     console.log('↩️ Redirecting to mobile deep link:', redirectUri);

//     return res.redirect(`${redirectUri}?token=${tokens.accessToken}`);
//   } catch (error) {
//     console.error('❌ Google callback error:', error);
//     return res.status(500).json({ message: 'OAuth callback failed', error });
//   }



}
