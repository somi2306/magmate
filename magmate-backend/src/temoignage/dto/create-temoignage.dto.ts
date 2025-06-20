// bard app/src backend/temoignage/dto/create-temoignage.dto.ts
import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateTemoignageDto {
  @IsString()
  @IsNotEmpty()
  commentaire: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  note?: number;

  // userId is removed from here
}