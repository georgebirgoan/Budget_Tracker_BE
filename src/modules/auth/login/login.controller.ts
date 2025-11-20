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
import type { Response } from 'express';
import { ApiOperation,ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class LoginController {
  constructor(
    private loginService: LoginService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)


  
  @Get('public')
  async getPublic() {
    return { message: 'Public route' };
  }


  @Get('session')
  @UseGuards(JwtAuthGuard)
  getSession(@Req() req) {
    return req.user;
  }

 

  @Post('login')
  @UseGuards(LocalAuthGuard)
    @ApiOperation({summary:"User login"})
    @ApiResponse({status:200,description:"User succes login"})
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
   async login(
  @Req() req,
  @Res({ passthrough: true }) res: Response
) {
   return this.loginService.login(req, req.user.id, res);
  }
 
  

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.loginService.refreshTokens(req.user.refreshToken);
  }


 @UseGuards(JwtAuthGuard)
@Post("logout")
async logOut(
  @Req() req,
  @Res({ passthrough: true }) res: Response
) {
  await this.loginService.signOut(req.user.id);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  return { message: "Logged out successfully" };
}


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
