import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginService } from '../../login/login.service';
import { UserAuthService } from '../../utils/user-service';

//strategies validate automate email + password

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private userAuthService:UserAuthService
  ) {
    super({ usernameField: 'email' }); 
  }

  async validate(email: string, password: string) {
     return this.userAuthService.validateUser(email,password);
  }
}
