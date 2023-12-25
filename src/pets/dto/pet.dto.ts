import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  Length,
  IsNumberString,
} from "class-validator";

export class CreatePetDto {
  @IsString()
  @Length(1, 300)
  name: string;

  @IsString()
  @Length(1, 100)
  type: string;

  @IsString()
  @Length(1, 300)
  breed: string;

  @IsInt()
  @Min(0)
  @Max(100)
  age: number;

  @IsInt()
  userId: number;

  @IsBoolean()
  isSterilized: boolean;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @Length(1, 300)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  type?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  breed?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsBoolean()
  isSterilized?: boolean;
}

export class FindPetsQueryDto {
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  page: number = 1;

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
