import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

  @ApiProperty({ default: 10, description: 'Cuantos registros serán visualizados' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // enabledImplicitConversions: true
  limit?: number;

  @ApiProperty({ default: 0, description: 'Cuantos registros serán saltados' })
  @IsOptional()
  @Min(0)
  @Type(() => Number) // enabledImplicitConversions: true
  offset?: number;
}