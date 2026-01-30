import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//LOCLA AUTH GUARDS
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
