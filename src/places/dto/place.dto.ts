import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PlaceDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty({ message: '전화번호' })
  title: string;

  @IsString()
  @IsOptional()
  telephone: string;
}
