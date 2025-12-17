import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/register.dto.';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import { Role } from '@prisma/client';
import { SessionService } from 'src/session/session.service';



@Injectable()
export class RegisterService {
  constructor(
    @Inject(refreshJwtConfig.KEY)
     private readonly refreshConfig: ConfigType<typeof refreshJwtConfig>,
    private readonly prisma: PrismaService,
    private sessionService:SessionService,
    private readonly jwtService : JwtService
  ) {}



  //create user for reddis
  // async create(createUserDto: CreateUserDto) {
  //   try {
  //     const sessionId = createUserDto.sessionId;
  //     console.log("sessionId din front pt register",sessionId);
  //     if(!sessionId){
        
  //     }
  //     const checkSessionId  = await  this.sessionService.getSession(sessionId);
      
  //     if(!checkSessionId || Object.keys(checkSessionId).length === 0){
  //       throw new NotFoundException("Nu s-a gasit sesiune pentru userul dat!");
  //     }
    
  //     const existUser = await this.prisma.user.findUnique({
  //       where:{email:createUserDto.email}
  //     })

  //     if(existUser) throw new BadRequestException("Email is already in use!");

  //     const saltRounds = 10;
  //     const hashPass = await bcrypt.hash(createUserDto.password,saltRounds);

  //     const savedUser = await this.prisma.user.create({
  //       data: {
  //         email: createUserDto.email,
  //         password: hashPass,
  //         fullName: createUserDto.fullName ?? 'defaultName',
  //         role:Role.USER,
  //         isActive:false
  //       },
  //     });
     
  // return {
  //   message:"User created with succes!",
  //   user: {
  //     id: savedUser.id,
  //     email: savedUser.email,
  //     fullName: savedUser.fullName
  //   },
  // };

  //   } catch (error) {
  //     console.error(' User creation failed:', error);
  //     throw error;
  //   }
  // }
  // async findByEmail(email: string) {
  //   return this.prisma.user.findUnique({
  //     where: { email },
  //   });
  // }



  //
  async create(createUserDto:CreateUserDto){
      const {fullName,email,password} = createUserDto;

      const existUser = await this.prisma.user.findFirst({
        where:{
          OR:[
            {fullName},
            {email}
          ]
        }
      });

      if(existUser){
          if(existUser.fullName === fullName){
            throw new ConflictException("Exista deja un utilizator cu acest nume!")
          }
          if(existUser.email === email){
                throw new ConflictException("Exista deja un utilizator cu acest email!")
          }
          throw new ConflictException("Utilizatorul exista deja!");
      }

      const hashPasw  = await bcrypt.hash(password,10);

      const user = await this.prisma.user.create({
        data:{
          fullName,
          email,
          password:hashPasw,
          role:'USER',
        },
        select:{
          fullName:true,
          email:true,
        }
      })

      return {
          fullName:user.fullName
      }
  }







  async findById(id:number){
    const user = await this.prisma.user.findUnique({
      where:{id}
    });

    if(!user) throw new NotFoundException("User negasit!")
    return user;
    }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        password: true,
      },
    });
  }

 
  async findAll() {
    return this.prisma.user.findMany();
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
