import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';


@Controller('comments')
@UseGuards(JwtAuthGuard,RolesGuard)
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post('engineers/:engineerId')
    @Roles(UserRole.MANAGER, UserRole.COMMERCIAL)
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
    @Roles(UserRole.MANAGER, UserRole.COMMERCIAL)
    async deleteComment(@Param('commentId') commentId: string) {
        await this.commentService.deleteComment(commentId);
        return { message: 'Commentaire supprimé avec succès' };
    }
}