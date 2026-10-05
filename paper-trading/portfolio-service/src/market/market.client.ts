import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, timeout } from 'rxjs';
import { MARKET_PACKAGE } from './grpc-client.options';
import { Quote } from './quote.dto';

/** Shape of the remote service, as declared in market.proto. */
interface MarketGrpcService {
  getQuote(request: { symbol: string }): Observable<Quote>;
  listInstruments(request: object): Observable<{ instruments: Quote[] }>;
}

const RPC_TIMEOUT_MS = 3000;

/** RPC client: the only class that knows market-service is reached through gRPC. */
@Injectable()
export class MarketClient implements OnModuleInit {
  private readonly logger = new Logger(MarketClient.name);
  private market: MarketGrpcService;

  constructor(@Inject(MARKET_PACKAGE) private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.market = this.client.getService<MarketGrpcService>('MarketService');
  }

  getQuote(symbol: string): Promise<Quote> {
    this.logger.log(`gRPC GetQuote(${symbol})`);
    return firstValueFrom(this.market.getQuote({ symbol }).pipe(timeout(RPC_TIMEOUT_MS)));
  }

  async listInstruments(): Promise<Quote[]> {
    this.logger.log('gRPC ListInstruments()');
    const reply = await firstValueFrom(this.market.listInstruments({}).pipe(timeout(RPC_TIMEOUT_MS)));
    return reply.instruments;
  }
}
