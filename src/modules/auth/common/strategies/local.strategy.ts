import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginService } from '../../login/login.service';
import { UserAuthService } from '../../utils/user-service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private userAuthService:UserAuthService
  ) {
    super({ usernameField: 'email' }); 
  }

  async validate(email: string, password: string) {

    if (!password || password.length === 0) {
      throw new UnauthorizedException('Please provide the password');
    }
    // const user = await this.userAuthService.validateUser(email, password);
    // if (!user ||  user === null || user.email === " User not found" || user.password === "Invalid password") {
    //   throw new UnauthorizedException('Invalid email or password');
    // }
    // return user; 
  }
}
