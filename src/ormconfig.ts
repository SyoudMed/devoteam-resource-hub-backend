import { User } from './users/entities/user.entity';
import { Engineer } from './engineer/entities/engineer.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',  
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'devoteam_resources_hub',
  entities: [User, Engineer], 
  synchronize: false,
  migrations: ['src/migrations/**/*.ts'],
};

export default typeOrmConfig;
