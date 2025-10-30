import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {

@IsEmail({}, { message: 'Invalid email' })
email: string;

@IsString()
@MinLength(6, { message: 'Password must be at least 6 characters long' })
password: string;

}