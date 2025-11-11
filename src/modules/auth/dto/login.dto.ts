import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {

@IsEmail({}, { message: 'Invalid email' })
@ApiProperty({example:"testul2@gmail.com",description:"Example of email"})
email: string;

@IsString()
@MinLength(6, { message: 'Password must be at least 6 characters long' })
@ApiProperty({example:"12345aA!!",description:"Example of password"})
password: string;

}