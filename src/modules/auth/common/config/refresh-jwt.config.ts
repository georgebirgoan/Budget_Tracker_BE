import { registerAs } from '@nestjs/config';
import {  JwtSignOptions } from '@nestjs/jwt';

export default registerAs('refresh-jwt', () => ({
  secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
  expiresIn: '7d',
}));
