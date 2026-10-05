import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('instruments')
export class Instrument {
  @PrimaryColumn()
  symbol: string;

  @Column()
  name: string;

  @Column('float')
  price: number;

  @Column({ default: 'EUR' })
  currency: string;
}
