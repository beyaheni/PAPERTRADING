import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  InsufficientFundsException,
  InsufficientPositionException,
  PortfolioNotFoundException,
} from '../common/business.exceptions';
import { MarketClient } from '../market/market.client';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { PositionValuation, Valuation } from './dto/valuation.dto';
import { Order, OrderSide } from './entities/order.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Business layer: every rule about portfolios and orders lives here. */
@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(Portfolio) private readonly portfolios: Repository<Portfolio>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly marketClient: MarketClient,
  ) {}

  async create(dto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.portfolios.save({ owner: dto.owner, cash: dto.initialCash, positions: [] });
    this.logger.log(`Portfolio ${portfolio.id} created for ${portfolio.owner} with ${portfolio.cash} cash`);
    return portfolio;
  }

  findAll(): Promise<Portfolio[]> {
    return this.portfolios.find({ relations: { positions: true }, order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Portfolio> {
    const portfolio = await this.portfolios.findOne({ where: { id }, relations: { positions: true } });
    if (!portfolio) {
      throw new PortfolioNotFoundException(id);
    }
    return portfolio;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    // Positions and orders are deleted explicitly, in the same transaction as the portfolio.
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Order, { portfolio: { id } });
      await manager.delete(Position, { portfolio: { id } });
      await manager.delete(Portfolio, { id });
    });
    this.logger.log(`Portfolio ${id} deleted`);
  }

  async findOrders(id: number): Promise<Order[]> {
    await this.findOne(id);
    return this.orders.find({ where: { portfolio: { id } }, order: { id: 'DESC' } });
  }

  /**
   * Executes an order at the current market price.
   * The price comes from market-service (gRPC); cash, position and order history
   * are then updated in one database transaction, so a failure leaves nothing half-done.
   */
  async placeOrder(id: number, dto: PlaceOrderDto): Promise<Order> {
    await this.findOne(id); // fail fast with 404 before calling the market
    const quote = await this.marketClient.getQuote(dto.symbol.toUpperCase());
    const amount = round2(quote.price * dto.quantity);

    const order = await this.dataSource.transaction(async (manager) => {
      const portfolio = await manager.findOneBy(Portfolio, { id });
      if (!portfolio) {
        throw new PortfolioNotFoundException(id);
      }
      const position = await manager.findOneBy(Position, { portfolio: { id }, symbol: quote.symbol });
      const held = position?.quantity ?? 0;

      if (dto.side === OrderSide.BUY) {
        if (portfolio.cash < amount) {
          throw new InsufficientFundsException(amount, portfolio.cash);
        }
        portfolio.cash = round2(portfolio.cash - amount);
        const heldCost = held * (position?.averagePrice ?? 0);
        await manager.save(Position, {
          ...position,
          portfolio,
          symbol: quote.symbol,
          quantity: held + dto.quantity,
          averagePrice: round2((heldCost + amount) / (held + dto.quantity)),
        });
      } else {
        if (!position || held < dto.quantity) {
          throw new InsufficientPositionException(quote.symbol, dto.quantity, held);
        }
        portfolio.cash = round2(portfolio.cash + amount);
        if (held === dto.quantity) {
          await manager.remove(position);
        } else {
          position.quantity = held - dto.quantity;
          await manager.save(position);
        }
      }

      await manager.save(portfolio);
      return manager.save(Order, {
        portfolio,
        symbol: quote.symbol,
        side: dto.side,
        quantity: dto.quantity,
        price: quote.price,
      });
    });

    this.logger.log(`Order ${order.id}: ${dto.side} ${dto.quantity} ${quote.symbol} @ ${quote.price} on portfolio ${id}`);
    const { portfolio: _portfolio, ...executed } = order;
    return executed as Order;
  }

  /** Values every position at the current market price (one gRPC call per position). */
  async valuate(id: number): Promise<Valuation> {
    const portfolio = await this.findOne(id);

    const positions: PositionValuation[] = await Promise.all(
      portfolio.positions.map(async (position) => {
        const quote = await this.marketClient.getQuote(position.symbol);
        return {
          symbol: position.symbol,
          quantity: position.quantity,
          averagePrice: position.averagePrice,
          marketPrice: quote.price,
          marketValue: round2(quote.price * position.quantity),
          unrealizedPnl: round2((quote.price - position.averagePrice) * position.quantity),
        };
      }),
    );

    const positionsValue = round2(positions.reduce((sum, p) => sum + p.marketValue, 0));
    return {
      portfolioId: portfolio.id,
      owner: portfolio.owner,
      cash: portfolio.cash,
      positions,
      positionsValue,
      totalValue: round2(portfolio.cash + positionsValue),
      unrealizedPnl: round2(positions.reduce((sum, p) => sum + p.unrealizedPnl, 0)),
    };
  }
}
