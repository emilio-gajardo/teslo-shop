import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

  @ApiProperty({ description: 'Email', nullable: false, type: String })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password', nullable: false, minLength: 1, maxLength: 6, type: String })
  @IsString()
  @MinLength(1)
  @MaxLength(6)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and number'
  })
  password: string;

  @ApiProperty({ description: 'fullname', nullable: false, minLength: 1, type: String })
  @IsString()
  @MinLength(1)
  fullname: string;
}