import { ApiProperty } from '@nestjs/swagger';
import { IsEmail,Matches, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {

@IsEmail({}, { message: 'Va rugam introduceti o adresa de email valida!' })
@IsNotEmpty({message:"Câmpul este obligatoriu!"})
@IsString({message:"Email-ul trebuie sa fie un string!"})
@MaxLength(255,{message:"Email-ul nu poate depăși 255 de caractere!"})
@ApiProperty({
    example:"testul2@gmail.com",
    description:"Example of email"
})
@Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
  message: 'Email-ul nu trebuie sa contina spatii sau caractere invalide!',
})
email: string;




@IsNotEmpty({message:"Parola este obligatorie!"})
@IsString({message:"Parola trebuie sa fie un sir de caractere!"})
@MinLength(6, { message: 'Parola trebuie sa aiba minim 6 caractere!' })
@MaxLength(128,{message:"Parola este prea lunga!"})
@ApiProperty({
    example:"12345aA!!",
    description:"Example of password"
})
password: string;
}