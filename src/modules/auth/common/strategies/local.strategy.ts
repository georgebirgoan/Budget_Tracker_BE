import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginService } from '../../login/login.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private loginService: LoginService) {
    super({ usernameField: 'email' }); 
  }

  async validate(email: string, password: string) {

    if (!password || password.length === 0) {
      throw new UnauthorizedException('Please provide the password');
    }
    const user = await this.loginService.validateUser(email, password);
    if (!user ||  user === null || user.email === " User not found" || user.password === "Invalid password") {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user; 
  }
}
