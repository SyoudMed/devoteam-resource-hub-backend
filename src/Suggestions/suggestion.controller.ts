import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Delete, Req } from '@nestjs/common';
import { SuggestionService } from './suggestion.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { CreateSuggestionDto } from '../Suggestions/dto/create-suggestion.dto';

@Controller('suggestions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  @Post('engineers/:engineerId')
  @Roles(UserRole.MANAGER)
  async AjouterSuggestion(
    @Param('engineerId', ParseIntPipe) engineerId: number,
    @Body() createSuggestionDto: CreateSuggestionDto,
    @Req() req: Request,
  ) {
    const authorId = (req.user as any).id;
    const { content, type } = createSuggestionDto;
    return this.suggestionService.addSuggestion(engineerId, authorId, content, type);
  }

  @Get('engineers/:engineerId')
  async getSuggestionsByEngineerId(@Param('engineerId', ParseIntPipe) engineerId: number) {
    return this.suggestionService.findSuggestionsByEngineerId(engineerId);
  }

  @Delete(':suggestionId')
  @Roles(UserRole.MANAGER)
  async deleteSuggestion(@Param('suggestionId') suggestionId: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    await this.suggestionService.deleteSuggestion(suggestionId, userId);
    return { message: 'Suggestion supprimée avec succès' };
  }
}