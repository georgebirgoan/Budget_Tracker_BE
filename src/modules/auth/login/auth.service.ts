import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/auth/register/user.service';
import { AuthJwtPayload } from 'src/modules/auth/common/types/auth-jwtPayload';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import { CurrentUser } from 'src/modules/auth/common/types/current-user';
import { CreateUserDto } from 'src/modules/auth/dto/register.dto.';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../dto/login.dto';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}


    async validateUser(email:string, password:string) {
      const user = await this.userService.findByEmail(email);

      if (!user){
        throw new UnauthorizedException('User not found');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid password');
        }

      return user;
  }

  
    async login(userId: number,loginDto:LoginUserDto)
     {

      const {email,password}=loginDto;
      console.log("Login attempt for:", email);
      console.log("Password length:", password ? password : 'no password');

      const { accessToken, refreshToken } = await this.generateTokens(userId);
      const saltRounds = 10;
      const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

      await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
      return {
        id: userId,
        accessToken,
        refreshToken,
      };
    }


  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
      const saltRounds = 10;
    const hashedRefreshToken = await bcrypt.hash(refreshToken,saltRounds);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Invalid Refresh Token');

    const refreshTokenMatches = await bcrypt.compare(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');

    return { id: userId };
  }

  async signOut(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, '');
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.userService.create(googleUser);
  }
}
