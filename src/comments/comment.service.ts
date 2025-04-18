import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
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

    async addComment(engineerId: number, authorId: number, content: string, rating: number): Promise<Comment> {
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
            rating,
            engineer,
            author,
            engineerId,
            authorId,
        });

        return this.commentRepository.save(comment);
    }


    async findCommentsByEngineerId(engineerId: number): Promise<Comment[]> {
        const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
        if (!engineer) {
            throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
        }

        const comments = await this.commentRepository.find({
            where: { engineerId },
            relations: ['author'],
            order: { date: 'DESC' },
        });

        return comments;
    }

    async deleteComment(commentId: string): Promise<void> {
        const comment = await this.commentRepository.findOne({ where: { id: commentId } });
        if (!comment) {
            throw new NotFoundException(`Commentaire avec l'ID ${commentId} non trouvé`);
        }

        await this.commentRepository.delete(commentId);
    }
}