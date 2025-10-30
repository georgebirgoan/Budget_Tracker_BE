import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow('DATABASE_URL'),
        entities: [path.resolve(__dirname, '..', '**/*.entity{.ts,.js}')],
        synchronize: true, // Note: set to false in production
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
