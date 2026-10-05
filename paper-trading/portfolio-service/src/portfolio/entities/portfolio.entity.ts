import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Position } from './position.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner: string;

  /** Cash available to buy instruments. */
  @Column('float')
  cash: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Position, (position) => position.portfolio)
  positions: Position[];
}
