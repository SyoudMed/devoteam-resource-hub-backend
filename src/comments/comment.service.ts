import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentType } from './entities/comment.entity';
import { Engineer } from '../engineer/entities/engineer.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addComment(
    engineerId: number,
    authorId: number,
    content: string,
    type: CommentType,
  ): Promise<Comment> {
    const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException(`Utilisateur avec l'ID ${authorId} non trouvé`);
    }

    const comment = this.commentRepository.create({
      content,
      type,
      engineer,
      author,
    });

    return this.commentRepository.save(comment);
  }

  async findCommentsByEngineerId(engineerId: number): Promise<Comment[]> {
    const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    return this.commentRepository.find({
      where: { engineer: { id: engineerId } },
      relations: ['author'],
      order: { date: 'DESC' },
    });
  }

  async deleteComment(commentId: string, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, author: { id: userId } },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException(
        `Commentaire avec l'ID ${commentId} non trouvé ou non autorisé`,
      );
    }

    await this.commentRepository.delete(commentId);
  }
}