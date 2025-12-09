import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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


  async create(createUserDto: CreateUserDto) {
    try {
      const sessionId = createUserDto.sessionId;
      console.log("sessionId din front pt register",sessionId);

      const checkSessionId  = await  this.sessionService.getSession(sessionId);
      
      if(!checkSessionId || Object.keys(checkSessionId).length === 0){
        throw new NotFoundException("Nu s-a gasit sesiune pentru userul dat!");
      }
    
      const existUser = await this.prisma.user.findUnique({
        where:{email:createUserDto.email}
      })

      if(existUser) throw new BadRequestException("Email is already in use!");

      const saltRounds = 10;
      const hashPass = await bcrypt.hash(createUserDto.password,saltRounds);

      const savedUser = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashPass,
          fullName: createUserDto.fullName ?? 'defaultName',
          role:Role.USER,
          isActive:false
        },
      });
     
  return {
    message:"User created with succes!",
    user: {
      id: savedUser.id,
      email: savedUser.email,
      fullName: savedUser.fullName
    },
  };

    } catch (error) {
      console.error(' User creation failed:', error);
      throw error;
    }
  }

  /**
   * Updates the hashed refresh token for a user.
   */
  // async updateHashedRefreshToken(userId: number) {
  //   return this.prisma.user.update({
  //     where: { id: userId }
  //   });
  // }

  /**
   * Finds a user by email.
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }


  async findById(id:number){
    const user = await this.prisma.user.findUnique({
      where:{id}
    });

    if(!user) throw new NotFoundException("User negasit!")
    return user;
    }

  /**
   * Finds a user by ID.
   */
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

  /**
   * Returns all users.
   */
  async findAll() {
    return this.prisma.user.findMany();
  }

  /**
   * Removes a user by ID.
   */
  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
