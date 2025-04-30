import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Delete, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

import { Request } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('engineers/:engineerId')
  @Roles(UserRole.MANAGER)
  async addComment(
    @Param('engineerId', ParseIntPipe) engineerId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const authorId = (req.user as any).id;
    const { content, type } = createCommentDto;
    return this.commentService.addComment(engineerId, authorId, content, type);
  }

  @Get('engineers/:engineerId')
 
  async getCommentsByEngineerId(@Param('engineerId', ParseIntPipe) engineerId: number) {
    return this.commentService.findCommentsByEngineerId(engineerId);
  }

  @Delete(':commentId')
  @Roles(UserRole.MANAGER)
  async deleteComment(@Param('commentId') commentId: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    await this.commentService.deleteComment(commentId, userId);
    return { message: 'Commentaire supprimé avec succès' };
  }
}