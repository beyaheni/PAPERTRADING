import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Portfolio } from './portfolio.entity';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/** An executed order: kept as the history of a portfolio. */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  portfolio: Portfolio;

  @Column()
  symbol: string;

  @Column({ type: 'varchar' })
  side: OrderSide;

  @Column('int')
  quantity: number;

  /** Price given by market-service when the order was executed. */
  @Column('float')
  price: number;

  @CreateDateColumn()
  executedAt: Date;
}
