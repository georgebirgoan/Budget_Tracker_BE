// import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { RegisterService } from 'src/modules/auth/register/register.service';
// import { AuthJwtPayload } from 'src/modules/auth/common/types/auth-jwtPayload';
// import refreshJwtConfig from '../common/config/refresh-jwt.config';
// import jwtConfig from '../common/config/jwt.config';
// import type { ConfigType } from '@nestjs/config';
// import * as bcrypt from 'bcrypt';
// import { LoginUserDto } from '../dto/login.dto';
// import { CurrentUser } from 'src/modules/auth/common/types/current-user';

// @Injectable()
// export class AuthService {
//   constructor(
//     // private userService: RegisterService,
//     // private jwtService: JwtService,
//     // @Inject(jwtConfig.KEY)
//     // private jwtCfg: ConfigType<typeof jwtConfig>,
//     // @Inject(refreshJwtConfig.KEY)
//     // private refreshCfg: ConfigType<typeof refreshJwtConfig>,
//   ) {}

//   /** ✅ Step 1: Validate email + password */
//   async validateUser(email: string, password: string) {
//     const user = await this.userService.findByEmail(email);
//     if (!user) throw new UnauthorizedException('User not found');

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) throw new UnauthorizedException('Invalid password');

//     return user;
//   }

//   /** ✅ Step 2: Generate access + refresh tokens */
//   private async generateTokens(userId: number) {
//     const payload: AuthJwtPayload = { sub: userId };

//   const accessToken = await this.jwtService.signAsync(payload, {
//   secret: this.jwtCfg.secret,
//   expiresIn: this.jwtCfg.expiresIn as any,
// });


//     const refreshToken = await this.jwtService.signAsync(payload, {
//       secret: this.refreshCfg.secret,
//       expiresIn: this.refreshCfg.expiresIn as any,
//     });

//     return { accessToken, refreshToken };
//   }

//   /** ✅ Step 3: Login flow */
//   async login(user: { id: number; email: string }) {
//     const { accessToken, refreshToken } = await this.generateTokens(user.id);

//     const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
//     await this.userService.updateHashedRefreshToken(user.id, hashedRefreshToken);

//     return {
//       id: user.id,
//       accessToken,
//       refreshToken,
//     };
//   }

//   /** ✅ Step 4: Validate + renew refresh token */
//   async refreshTokens(userId: number, refreshToken: string) {
//     const user = await this.userService.findOne(userId);
//     if (!user || !user.hashedRefreshToken)
//       throw new UnauthorizedException('No stored refresh token');

//     const isValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
//     if (!isValid) throw new UnauthorizedException('Invalid refresh token');

//     return this.login({ id: user.id, email: user.email });
//   }

//   /** ✅ Step 5: Logout (invalidate refresh token) */
//   async signOut(userId: number) {
//     await this.userService.updateHashedRefreshToken(userId, '');
//   }

//   /** ✅ Used by JwtStrategy */
//   async validateJwtUser(userId: number) {
//     const user = await this.userService.findOne(userId);
//     if (!user) throw new UnauthorizedException('User not found!');
//     const currentUser: CurrentUser = { id: user.id };
//     return currentUser;
//   }
// }
