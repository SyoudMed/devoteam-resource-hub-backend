import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';


@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post('engineers/:engineerId')
    async addComment(
        @Param('engineerId', ParseIntPipe) engineerId: number,
        @Body('authorId') authorId: number,
        @Body('content') content: string,
        @Body('rating') rating: number,
    ) {
        return this.commentService.addComment(engineerId, authorId, content, rating);
    }

    @Get('engineers/:engineerId')
    async getCommentsByEngineerId(@Param('engineerId', ParseIntPipe) engineerId: number) {
        return this.commentService.findCommentsByEngineerId(engineerId);
    }

    @Delete(':commentId')
    @UseGuards(JwtAuthGuard)
    async deleteComment(@Param('commentId') commentId: string) {
        await this.commentService.deleteComment(commentId);
        return { message: 'Commentaire supprimé avec succès' };
    }
}