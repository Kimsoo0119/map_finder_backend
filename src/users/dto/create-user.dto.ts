import { SignUpType } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  signUpType: SignUpType;

  @IsString()
  @IsNotEmpty()
  nickname: string;
}
