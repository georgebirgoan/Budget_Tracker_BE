import { ApiProperty } from '@nestjs/swagger';
import { IsEmail,MinLength, IsString,Matches, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({
    example:"George Andreica",description:"User name"
  })
  fullName: string;

  
  @IsEmail({}, { message: 'Invalid email address' })
    @ApiProperty({
    example:"george.andreica@gmail.com",description:"Email "
  })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
     @ApiProperty({
    example:"stroongpassword2cdw",description:"User password"
  })
  password: string;

  @IsString()
  @ApiProperty({
    example:"USER",description:"User role!"
  })
  role:string

  @IsBoolean()
  @ApiProperty({
    example:"false",description:"User active or not!"
  })
  isActive:boolean

}
