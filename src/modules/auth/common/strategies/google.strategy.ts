import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import type  { ConfigType } from '@nestjs/config';
import { AuthService } from '../../login/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clinetID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    console.log("in google startegy",{ profile });
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.name.givenName,
      password: '',
      confirmPassword: '',
    });
    // done(null, user);
    return user;
  }
}
