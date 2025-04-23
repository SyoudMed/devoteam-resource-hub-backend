import { IsString, IsEnum } from 'class-validator';
import { CommentType } from '../entities/comment.entity';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsEnum(CommentType)
  type: CommentType;
}