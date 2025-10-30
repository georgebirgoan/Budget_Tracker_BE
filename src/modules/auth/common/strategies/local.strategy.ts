import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../login/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); 
  }

  async validate(email: string, password: string) {

    console.log("email received in strategy:", email);
    console.log("password received in strategy:", password ? password : 'no password');
    if (!password || password.length === 0) {
      throw new UnauthorizedException('Please provide the password');
    }

    console.log('🟡 LocalStrategy.validate called with:', email,"and password length:", password.length);

    const user = await this.authService.validateUser(email, password);
    console.log('🟡 LocalStrategy.validate result for', email, ':', user);

    if (user === null || user.email === " User not found" || user.password === " Invalid password") {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user; 

  }
}
