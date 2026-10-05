import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instrument } from './instrument.entity';
import { INSTRUMENT_SEED } from './instrument.seed';

/** Thrown by the service layer; the gRPC layer translates it into a NOT_FOUND status. */
export class UnknownSymbolError extends Error {
  constructor(public readonly symbol: string) {
    super(`Unknown symbol '${symbol}'`);
  }
}

@Injectable()
export class InstrumentService implements OnModuleInit {
  private readonly logger = new Logger(InstrumentService.name);

  /** Max relative price move applied on each quote (0 = fixed prices). */
  private readonly volatility = Number(process.env.PRICE_VOLATILITY ?? 0.005);

  constructor(
    @InjectRepository(Instrument)
    private readonly instruments: Repository<Instrument>,
  ) {}

  async onModuleInit(): Promise<void> {
    if ((await this.instruments.count()) === 0) {
      await this.instruments.save(INSTRUMENT_SEED);
      this.logger.log(`Database seeded with ${INSTRUMENT_SEED.length} instruments`);
    }
  }

  findAll(): Promise<Instrument[]> {
    return this.instruments.find({ order: { symbol: 'ASC' } });
  }

  /**
   * Returns the current quote of an instrument.
   * The price follows a small random walk to simulate a live market;
   * the new price is persisted so every caller sees the same market.
   */
  async quote(symbol: string): Promise<Instrument> {
    const instrument = await this.instruments.findOneBy({ symbol: symbol.toUpperCase() });
    if (!instrument) {
      throw new UnknownSymbolError(symbol);
    }
    if (this.volatility > 0) {
      const move = 1 + (Math.random() * 2 - 1) * this.volatility;
      instrument.price = Math.round(instrument.price * move * 100) / 100;
      await this.instruments.save(instrument);
    }
    return instrument;
  }
}
