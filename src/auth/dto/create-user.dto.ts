import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(6)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and number'
  })
  password: string;

  @IsString()
  @MinLength(1)
  fullname: string;
}