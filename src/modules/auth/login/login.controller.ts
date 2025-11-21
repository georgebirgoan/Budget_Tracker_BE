import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
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
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../common/config/jwt.config';

@Controller('auth')
export class LoginController {
  constructor(
    private loginService: LoginService,
    private prisma:PrismaService,
    private jwtService:JwtService,
     @Inject(jwtConfig.KEY) private jwtCfg: ConfigType<typeof jwtConfig>,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)


  
  @Get('public')
  async getPublic() {
    return { message: 'Public route' };
  }


  @Get('session')
    @ApiOperation({summary:"User sesion"})
    @ApiResponse({status:200,description:"User succes login"})
    @ApiResponse({ status: 401, description: 'Invalid session.' })
   async sesiune(
  @Req() req,
  @Res({ passthrough: true }) res: Response
) {
   return this.loginService.getSessionFromTokens(req, res);
  }
 



//  @UseGuards(RefreshAuthGuard)
//   @Post("refresh")
//   async refresh(@Req() req, @Res() res) {
//     const user = req.user;

//     const tokens = await this.loginService.generateTokens(user.id);

//     // set new cookies
//     res.cookie("access_token", tokens.accessToken, {
//       httpOnly: true,
//       sameSite: "strict",
//       secure: true,
//     });

//     res.cookie("refresh_token", tokens.refreshToken, {
//       httpOnly: true,
//       sameSite: "strict",
//       secure: true,
//     });

//     return res.json({
//       user,
//       accessToken: tokens.accessToken,
//     });
  // }


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
