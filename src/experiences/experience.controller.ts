import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ExperienceService, CreateExperienceDto, UpdateExperienceDto } from './experience.service';
import { Experience } from './entities/experience.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';


@Controller('experiences')
@UseGuards(JwtAuthGuard)

export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}


  @Post()
  async create(@Body() createExperienceDto: CreateExperienceDto): Promise<Experience> {
    return this.experienceService.create(createExperienceDto);
  }


  @Get('engineer/:engineerId')
  async findByEngineerId(@Param('engineerId', ParseIntPipe) engineerId: number): Promise<Experience[]> {
    return this.experienceService.findByEngineerId(engineerId);
  }


  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Experience> {
    return this.experienceService.findOne(id);
  }


  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ): Promise<Experience> {
    return this.experienceService.update(id, updateExperienceDto);
  }


  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.experienceService.delete(id);
  }

  
  @Delete('engineer/:engineerId')
  async deleteByEngineerId(@Param('engineerId', ParseIntPipe) engineerId: number): Promise<{ message: string }> {
    return this.experienceService.deleteByEngineerId(engineerId);
  }
}