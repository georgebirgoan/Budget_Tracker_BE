import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
  Param,
  ParseIntPipe,
  NotFoundException
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
import { UserSessionService } from '../utils/session-service';

@Controller('auth')
export class LoginController {
  constructor(
    private loginService: LoginService,
    private userSessionService:UserSessionService,
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

  @Post('login')
  @UseGuards(LocalAuthGuard)
    @ApiOperation({summary:"User login"})
    @ApiResponse({status:200,description:"User succes login"})
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
   async login(
  @Req() req,
  @Res({ passthrough: true }) res: Response
) {
  const result = await this.loginService.login(req,req.user.id,res);
  return result;
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


  @UseGuards(JwtAuthGuard)
  @Get("sessions")
  async listSessions(@Req() req) {
    return this.userSessionService.getSessionsByUser(req.user.id);
  }

@Post("logout/:id")
async logout(
  @Param("id") sessionId: number,
  @Res({ passthrough: true }) res: Response
) {
  const deleted = await this.userSessionService.revokeSession(sessionId);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.clearCookie("session_id");

  if (!deleted) {
    throw new NotFoundException("Session not found or already revoked");
  }
  return { message: "Logout successful" };
}



  






//  @UseGuards(JwtAuthGuard)
// @Post("logout")
// async logOut(
//   @Req() req,
//   @Res({ passthrough: true }) res: Response
// ) {
//   await this.loginService.signOut(req.user.id);

//   res.clearCookie("access_token");
//   res.clearCookie("refresh_token");

//   return { message: "Logged out successfully" };
// }




}
