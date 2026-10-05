import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Portfolio } from './portfolio.entity';

/** Quantity of one instrument held in a portfolio. */
@Entity('positions')
@Unique(['portfolio', 'symbol'])
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.positions, { onDelete: 'CASCADE' })
  portfolio: Portfolio;

  @Column()
  symbol: string;

  @Column('int')
  quantity: number;

  /** Average purchase price, used to compute the unrealized profit and loss. */
  @Column('float')
  averagePrice: number;
}
