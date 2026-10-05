import { ApiProperty } from '@nestjs/swagger';

export class Quote {
  @ApiProperty({ example: 'BNP' })
  symbol: string;

  @ApiProperty({ example: 'BNP Paribas' })
  name: string;

  @ApiProperty({ example: 63.1 })
  price: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;
}
