import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',  
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'devoteam_resources_hub',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['src/migrations/**/*.ts'],
};

export default typeOrmConfig;
