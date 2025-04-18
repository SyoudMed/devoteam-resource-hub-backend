import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Engineer } from './engineer/entities/engineer.entity';
import { Comment } from './comments/entities/comment.entity';
import { Experience } from './experiences/entities/experience.entity';

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'devoteam_resources_hub',
  entities: [
    User,
    Engineer,
    Comment,
    Experience, 
    __dirname + '/**/*.entity{.ts,.js}', 
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});