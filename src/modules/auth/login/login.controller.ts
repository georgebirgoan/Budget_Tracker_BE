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
  Body,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { LocalAuthGuard } from '../common/guards/local-auth/local-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { GoogleAuthGuard } from '../common/guards/google-auth/google-auth.guard';
import type { Response,Request } from 'express';
import { ApiOperation,ApiResponse } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../common/config/jwt.config';
import { UserSessionService } from '../utils/session-service';
import { LoginUserDto } from '../dto/login.dto';

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


  // @UseGuards(LocalAuthGuard)
  @Post('login')
    @ApiOperation({summary:"User login"})
    @ApiResponse({status:200,description:"User succes login"})
    @ApiResponse({ status: 401, description: 'Parola gresita!.' })
   async login(
  @Body() data:LoginUserDto,
  @Req() req:Request,
  @Res({ passthrough: true }) res: Response
) {
  const result = await this.loginService.login(data,res,req);
  return result;
  }


@Get('sessions')
@ApiOperation({ summary: "User session" })
@ApiResponse({ status: 200, description: "User session returned" })
@ApiResponse({ status: 401, description: "Invalid session." })
@ApiResponse({ status: 404, description: "Unthorized session." })
async getAllSession(
  @Req() req,
  @Res({ passthrough: true }) res: Response
) {
  return this.loginService.getAllSessions();
}


@Get('session')
@ApiOperation({ summary: "Get current user session_id" })
async getCurrentSession(
  @Req() req,
) {
  const sessionId = req.cookies.session_id;
  if(!sessionId){
    throw new NotFoundException("Nu exista nici o seseiune validă pentru dvs!");
  }
  return this.loginService.getSession(sessionId);
}


@Post("logout/:id")
async logout(
  @Param("id") sessionId: string,
  @Res({ passthrough: true }) res: Response
) {
  try {
    const session = await this.userSessionService.revokeSession(sessionId);

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("session_id");

    if (!session) {
      throw new NotFoundException("Nu exista sesiune pentru userul dat!");
    }

    await this.userSessionService.updateDeconected(session.userId);

    return { message: "Delogare cu success!" };
  } catch (error) {
    console.error("Error in logout():", error);
    throw error;
  }
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
