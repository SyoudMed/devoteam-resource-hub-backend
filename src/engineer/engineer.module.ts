import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engineer } from './entities/engineer.entity';
import { EngineerService } from './engineer.service';
import { EngineerController } from './engineer.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Engineer])],
    providers: [EngineerService],
    controllers: [EngineerController],
    exports: [EngineerService],
})
export class EngineerModule {}
