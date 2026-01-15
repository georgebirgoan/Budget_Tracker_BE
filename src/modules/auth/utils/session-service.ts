import { Injectable, NotFoundException,Inject,UnauthorizedException} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service"
import { JwtService } from "@nestjs/jwt";
import jwtConfig from '../common/config/jwt.config';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSessionService{
    constructor(
        private prisma:PrismaService,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtCfg: ConfigType<typeof jwtConfig>,

        @Inject(refreshJwtConfig.KEY)
        private readonly refreshCfg: ConfigType<typeof refreshJwtConfig>

    ){}

     async createDeviceSession(data:{
            userId:number,
            refreshToken:string,
            ip:string,
            userAgent:string,
            deviceName:string
        })
            {
                return this.prisma.session.create({
                    data: {
                    userId:data.userId,
                    refreshToken:data.refreshToken ,
                    ip:data.ip,
                    userAgent:data.userAgent,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    deviceName: data.deviceName,
            },
        });
        }
    
            
    // async refreshTokens(refreshToken: string) {
    
    //         const session = await this.prisma.session.findFirst({
    //             where: { revoked: false },
    //             include:{
    //                 user:{
    //                     select:{
    //                         id:true,
    //                         email:true,
    //                         fullName:true,
    //                         role:true
    //                     }
    //                 }
    //             }
    //         });
    
    //         if (!session) throw new UnauthorizedException("Invalid session");
    
    //         const payload = this.jwtService.verify(refreshToken, {
    //             secret: this.jwtCfg.refreshSecret,
    //         });
    
    //         if (payload.sub !== session.userId) {
    //             throw new UnauthorizedException("Token does not belong to user");
    //         }
    
    //         // Rotate session refresh token (important!)
    //         const newRefreshToken = await this.jwtService.signAsync(payload, {
    //             expiresIn: "30d",
    //         });
    
    //         const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    
    //         await this.prisma.session.update({
    //             where: { id: session.id },
    //             data: {
    //             refreshToken: newRefreshHash,
    //             },
    //         });
    
    //         const accessToken = await this.jwtService.signAsync(payload, {
    //             expiresIn: "15m",
    //         });
    
    //         return {
    //             accessToken,
    //             refreshToken: newRefreshToken,
    //             user: session.user,
    //         };
    //     }
    async getSessionsByUser(userId: number) {
    return this.prisma.session.findMany({
    where: { userId, revoked: false },
    select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
        revoked: true,
        deviceName:true
    },
    });
        }




//    async revokeSession(sessionId: string) {
//         const raw = await this.redis.get(`session:${sessionId}`);
//         if (!raw) return null;

//         const session = JSON.parse(raw);


//         return session; 
// }


// async updateDeconected(userId:string){
//    try{
//     if(!userId){
//         throw new NotFoundException("Nu sa gasit user Id");
//     }
//        await this.redis.hSet(`userId:${userId}`, "deconectedAt", new Date().toISOString());
//    }catch(err){
//         throw new NotFoundException("Eroare UPDATE deconected! ",err);
//    }
// }
}