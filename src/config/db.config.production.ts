import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as path from 'path';

export default (): PostgresConnectionOptions => ({
  // Don't put this here, Instead put in the env file
  url: process.env.url,
  type: 'postgres',
  port: Number(process.env.PORT) || 5432,
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],

  synchronize: true, //disable in production
});
