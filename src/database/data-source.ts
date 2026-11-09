import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * Джерело даних для TypeORM CLI.
 * Використовується лише командами migration:generate / run / revert / show,
 * тому працює зі скомпільованими файлами з каталогу dist.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'auto_parts',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: ['schema'],
});
