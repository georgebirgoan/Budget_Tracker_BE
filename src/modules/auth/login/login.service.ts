import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterService } from 'src/modules/auth/register/register.service';
import { AuthJwtPayload } from 'src/modules/auth/common/types/auth-jwtPayload';
import jwtConfig from '../common/config/jwt.config';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CurrentUser } from 'src/modules/auth/common/types/current-user';
import { CreateUserDto } from 'src/modules/auth/dto/register.dto.';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoginService {
  constructor(
    private prisma:PrismaService,
    private readonly userService: RegisterService,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshCfg: ConfigType<typeof refreshJwtConfig>,
  ) {}

  /** ✅ 1. Validate email + password */
  async validateUser(email: string, password: string) {
    console.log("email validare",email);
    const user = await this.prisma.user.findUnique({
      where:{email}
    });

    console.log("ajunge in validare user");
    if (!user) throw new UnauthorizedException('User not found');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Password  is not matching!');

    return user;
  }

  /** ✅ 2. Generate both access & refresh tokens */
  private async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtCfg.secret,
      expiresIn: this.jwtCfg.expiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshCfg.secret,
      expiresIn: this.refreshCfg.expiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  /** ✅ 3. Login user (generate + store hashed refresh token) */
  async login(userId: number) {
    console.log("AJUNGE FUNCTIE LOGIN");
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    console.log("user din prisma:",user);

    if (!user) throw new Error('User not found!!');

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
    );

    console.log("acces token in login",accessToken);
    console.log("refresh token in login",refreshToken);

    // 3️⃣ Hash refresh token for storage
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    // 4️⃣ Save hashed refresh token in DB
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: hashedRefresh },
    });

    // 5️⃣ Return the tokens
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };

  }

  async validateRefreshToken(refreshToken: string) {
    try {
      // 1. Decode & verify using refresh secret
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshCfg.secret,
      });

      const userId = payload.sub;
      if (!userId) throw new UnauthorizedException('Invalid refresh token payload');

      // 2. Get user from DB
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('No refresh token stored');
      }

      // 3. Compare hashed refresh token in DB
      const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      // 4. Return user if valid
      return user;
    } catch (err) {
      console.error('❌ Refresh token validation failed:', err.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /** ✅ 4. Refresh token flow (verify + issue new tokens) */
  async refreshTokens(token:string) {
      const user = await this.validateRefreshToken(token);
      if (!user) throw new UnauthorizedException();

      const { accessToken, refreshToken } = await this.generateTokens(user.id);
      await this.userService.updateHashedRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken };
  }


  

  /** ✅ 5. Logout user (clear refresh token) */
  async signOut(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, '');
  }

  

  /** ✅ 6. Used by JwtStrategy to attach user to request */
  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id };
    return currentUser;
  }

  /** ✅ 7. Handle Google login/register */
  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (user) return user;
    return this.userService.create(googleUser);
  }
}
