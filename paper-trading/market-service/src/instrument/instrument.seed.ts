import { Instrument } from './instrument.entity';

/** Instruments inserted the first time the service starts on an empty database. */
export const INSTRUMENT_SEED: Instrument[] = [
  { symbol: 'AIR', name: 'Airbus', price: 152.4, currency: 'EUR' },
  { symbol: 'BNP', name: 'BNP Paribas', price: 63.1, currency: 'EUR' },
  { symbol: 'GLE', name: 'Societe Generale', price: 27.85, currency: 'EUR' },
  { symbol: 'MC', name: 'LVMH', price: 698.2, currency: 'EUR' },
  { symbol: 'OR', name: "L'Oreal", price: 401.5, currency: 'EUR' },
  { symbol: 'SAN', name: 'Sanofi', price: 94.3, currency: 'EUR' },
  { symbol: 'TTE', name: 'TotalEnergies', price: 61.75, currency: 'EUR' },
];
