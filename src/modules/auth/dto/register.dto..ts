import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail,MinLength,MaxLength, IsString,Matches, IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({message:"Acest camp este obligatoriu!"})
  @IsString({message:"Numele complet trebuie sa fie un sir de caractere!"})
  @MinLength(3, { message: 'Numele trebuie sa contina minim 3 caractere!' })
  @MaxLength(50, { message: 'Numele nu poate depasi 50 de caractere!' })
  @Matches(/^[a-zA-ZăîâșțĂÎÂȘȚ' -]+$/, {
    message: 'Numele poate contine doar litere, spatii, apostrof si cratime!',
  })

  @ApiProperty({
    example:"George Andreica",description:"User name"
  })
  fullName: string;

  
  //validare emial register
  @IsNotEmpty({ message: 'Emailul este obligatoriu!' })
  @IsString({ message: 'Emailul trebuie sa fie un sir de caractere!' })
  @MaxLength(255, { message: 'Emailul nu poate depasi 255 de caractere!' })
  @IsEmail({}, { message: 'Va rugam introduceti o adresa de email valida!' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Emailul nu trebuie sa contina spatii sau caractere invalide!',
  })
  @ApiProperty({
    example: "testul2@gmail.com",
    description: "Adresa de email a utilizatorului"
  })
  email: string;


  //validare parola register 8 carcatere,1Upp,1Low,1digit,1 special,max 128
  @IsNotEmpty({ message: 'Parola este obligatorie!' })
  @IsString({ message: 'Parola trebuie sa fie un sir de caractere!' })
  @MinLength(8, { message: 'Parola trebuie sa contina minim 8 caractere!' })
  @MaxLength(128, { message: 'Parola este prea lunga!' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Parola trebuie sa contina cel putin o litera mica!',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Parola trebuie sa contina cel putin o litera mare!',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Parola trebuie sa contina cel putin o cifra!',
  })
  @Matches(/(?=.*[@$!%*?&\-_#^])/ , {
    message: 'Parola trebuie sa contina cel putin un caracter special!',
  })
  @ApiProperty({
    example: "Test1234!",
    description: "Parola puternica a utilizatorului"
  })
  password: string;
}
