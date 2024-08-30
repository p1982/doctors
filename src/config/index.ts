import convict from 'convict';

interface MyConfig {
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  SECRET_KEY: string;
}
const config = convict<MyConfig>({
  PORT: {
    doc: 'The port to bind.',
    format: Number,
    default: 8000,
    env: 'PORT',
  },
  HOST: {
    doc: 'The host to bind.',
    format: String,
    default: 'localhost',
    env: 'HOST',
  },
  DATABASE_URL: {
    doc: 'The database connection URL.',
    format: String,
    //'postgres://ntqouthr:Kq1xuaXMsJoo2g8Sq8FWcsoUYvV_vqJg@abul.db.elephantsql.com/ntqouthr',
    default: 'postgres://postgres:1@db:5432/new',
    env: 'DATABASE_URL',
  },
  SECRET_KEY: {
    doc: 'Secret key to use',
    format: String,
    default: '1111122222aABCDEFGHJKLMNPQ',
    env: 'SECRET_KEY',
  },
});
const DATABASE_URL = config.get('DATABASE_URL');
export const dbConfig = {
  host: 'db', // Имя сервиса базы данных из Docker Compose
  // host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '1',
  database: 'new',
  url: DATABASE_URL,
};
// Валидация конфигурации
config.validate({ allowed: 'strict' });

export default config;
