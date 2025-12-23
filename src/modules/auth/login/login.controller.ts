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
  UnauthorizedException,
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
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { tr } from 'zod/v4/locales';
import bcrypt from 'bcrypt';
import refreshJwtConfig from '../common/config/refresh-jwt.config';


@Controller('auth')
export class LoginController {
  constructor(
    private loginService: LoginService,
    private userSessionService:UserSessionService,

    private prisma:PrismaService,
    private jwtService:JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,
     
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshCfg: ConfigType<typeof refreshJwtConfig>
     
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


  

@Post('refresh')
@Public()
async refresh(@Req() req,
 @Res({ passthrough: true }) res: Response) 
 {
  const refreshToken = req.cookies?.refresh_token;
  console.log("refresh token coookies:",refreshToken);
  if (!refreshToken) throw new UnauthorizedException('Nu exista refresh token!');

 const  payload = await this.loginService.checkSignature(refreshToken)
  const userId = payload.sub;
  const sessionId = payload.sessionId;

  console.log("User payload din semnatura din refresh",userId);
  console.log(" din paylaod refresh",sessionId);

  const session = await this.loginService.findSessionActive(sessionId,userId);
  console.log("sesiune functie gasut ceva:",session);
  if(!session){
    throw new UnauthorizedException("Sesiune invalidă! Vă rugăm logați-vă!")
  }

  if (!session?.refreshToken) {
    throw new UnauthorizedException('Nu exista nici un refresh token valid!');
  }

  const ok = await bcrypt.compare(refreshToken, session.refreshToken);
  if (!ok)
    {
      throw new UnauthorizedException('Nepotrivire de chei refresh!');
    } 


  const {newAccessToken,newRefreshToken} = await this.loginService.setNewTokens(session);

  const newHash = await bcrypt.hash(newRefreshToken, 10);
  await this.prisma.session.update({
    where: { id: session.id },
    data: { refreshToken: newHash },
  });
  
  await this.loginService.setInCookie(res,newAccessToken,newRefreshToken);

  return { ok: true };
}


// @Get('sessions')
// @ApiOperation({ summary: "User session" })
// @ApiResponse({ status: 200, description: "User session returned" })
// @ApiResponse({ status: 401, description: "Invalid session." })
// @ApiResponse({ status: 404, description: "Unthorized session." })
// async getAllSession(
//   @Res({ passthrough: true }) res: Response
// ) {
//   return this.loginService.getAllSessions();
// }


@Get('session')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: "Get current user session_id" })
async getCurrentSession(
  @Req() req,
) {
  const userId = req.user.id
  const sessionId = req.user.sessionId;

  if(!sessionId){
    throw new NotFoundException("Nu exista nici o seseiune validă pentru dvs!");
  }

  const session = await this.loginService.getSessionUser(userId,sessionId);
  const findLastDisconected = await this.loginService.getLastDeconectedAt(userId);
  

  return{
    user:{
      id:req.user.id,
      email:req.user.email,
      fullName:req.user.fullName,
      role:req.user.role,
      deconectedAt:findLastDisconected?.deconectedAt
    },
    session
  }
}

//logout redis
// @Post("logout/:id")
// async logout(
//   @Param("id") sessionId: string,
//   @Res({ passthrough: true }) res: Response
// ) {
//   try {
    // const session = await this.userSessionService.revokeSession(sessionId);

//     res.clearCookie("access_token");
//     res.clearCookie("refresh_token");
//     res.clearCookie("session_id");

//     if (!session) {
//       throw new NotFoundException("Nu exista sesiune pentru userul dat!");
//     }

    // await this.userSessionService.updateDeconected(session.userId);

//     return { message: "Delogare cu success!" };
//   } catch (error) {
//     console.error("Error in logout():", error);
//     throw error;
//   }
// }



  






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

@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@Req() req,@Res({passthrough:true}) res:Response){
  const userId = req.user.id;
  const sessionId = req.user.sessionId;
  
  await this.prisma.session.updateMany({
    where:{id:sessionId,userId},
    data:{
      revoked:true,
      deconectedAt:new Date()
    }
  })

  res.clearCookie('access_token');
  res.clearCookie('refresh_token',{path:'/'});

  return {ok:true}
}

}
