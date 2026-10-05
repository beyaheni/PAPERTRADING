import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({ example: 10000, description: 'Starting cash' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  initialCash: number;
}
