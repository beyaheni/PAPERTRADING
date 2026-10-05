import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketClient } from './market.client';
import { Quote } from './quote.dto';

@ApiTags('instruments')
@Controller('instruments')
export class MarketController {
  constructor(private readonly marketClient: MarketClient) {}

  @Get()
  @ApiOperation({ summary: 'List tradable instruments (fetched from market-service through gRPC)' })
  @ApiOkResponse({ type: [Quote] })
  findAll(): Promise<Quote[]> {
    return this.marketClient.listInstruments();
  }
}
