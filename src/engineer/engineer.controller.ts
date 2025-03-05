import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EngineerService } from './engineer.service';
import { Engineer } from './entities/engineer.entity';


@Controller('engineers')
export class EngineerController {
  constructor(private readonly engineerService: EngineerService) {}
  @Get()
  async findAll(): Promise<Engineer[]> {
    return this.engineerService.findAll();
  }
  @Post()
  async create(@Body() engineerData: Partial<Engineer>): Promise<Engineer> {
    return this.engineerService.create(engineerData);
  }
/*
 

  @Get()
  async findAll(): Promise<Engineer[]> {
    return this.engineerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Engineer> {
    return this.engineerService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() engineerData: Partial<Engineer>): Promise<Engineer> {
    return this.engineerService.update(id, engineerData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.engineerService.delete(id);
  }*/



}
