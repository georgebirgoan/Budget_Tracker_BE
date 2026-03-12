import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any) {
    if (err) throw err;
    if (!user) throw new UnauthorizedException(info?.message ?? 'Email sau parola gresite!');
    return user;
  }
}
