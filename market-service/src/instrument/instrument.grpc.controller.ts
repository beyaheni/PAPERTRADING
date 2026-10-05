import { status } from '@grpc/grpc-js';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Instrument } from './instrument.entity';
import { InstrumentService, UnknownSymbolError } from './instrument.service';

interface QuoteRequest {
  symbol: string;
}

/** gRPC entry point (web layer): implements the MarketService of market.proto. */
@Controller()
export class InstrumentGrpcController {
  private readonly logger = new Logger(InstrumentGrpcController.name);

  constructor(private readonly instrumentService: InstrumentService) {}

  @GrpcMethod('MarketService', 'GetQuote')
  async getQuote(request: QuoteRequest): Promise<Instrument> {
    this.logger.log(`GetQuote(${request.symbol})`);
    if (!request.symbol) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'symbol is required' });
    }
    try {
      return await this.instrumentService.quote(request.symbol);
    } catch (error) {
      if (error instanceof UnknownSymbolError) {
        this.logger.warn(error.message);
        throw new RpcException({ code: status.NOT_FOUND, message: error.message });
      }
      throw error;
    }
  }

  @GrpcMethod('MarketService', 'ListInstruments')
  async listInstruments(): Promise<{ instruments: Instrument[] }> {
    this.logger.log('ListInstruments()');
    return { instruments: await this.instrumentService.findAll() };
  }
}
