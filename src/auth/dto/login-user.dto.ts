import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {

  @ApiProperty({ description: 'email', nullable: false, type: String })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password', nullable: false, type: String })
  @IsString()
  @MinLength(1)
  @MaxLength(6)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and number'
  })
  password: string;

}