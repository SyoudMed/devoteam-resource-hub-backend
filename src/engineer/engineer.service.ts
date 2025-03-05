import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Engineer } from './entities/engineer.entity';

@Injectable()
export class EngineerService {
  constructor(
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
  ) {}

  async create(engineerData: Partial<Engineer>): Promise<Engineer> {
    const engineer = this.engineerRepository.create(engineerData);
    return this.engineerRepository.save(engineer);
  }

  async findAll(): Promise<Engineer[]> {
    return this.engineerRepository.find({ relations: ['user'] });
  }

  

  

  async delete(id: string): Promise<void> {
    await this.engineerRepository.delete(id);
  }
}
