import { mkdirSync } from 'fs';
import { dirname } from 'path';

/** Path of the SQLite file of this service; its folder is created on first start. */
export function databaseFile(): string {
  const file = process.env.DB_FILE ?? 'data/portfolio.sqlite';
  mkdirSync(dirname(file), { recursive: true });
  return file;
}
