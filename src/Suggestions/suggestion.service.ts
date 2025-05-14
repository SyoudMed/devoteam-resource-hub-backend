import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suggestion, SuggestiontType } from './entities/Suggestion.entity';
import { Engineer } from '../engineer/entities/engineer.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SuggestionService {
  constructor(
    @InjectRepository(Suggestion)
    private suggestionRepository: Repository<Suggestion>,
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addSuggestion(
    engineerId: number,
    authorId: number,
    content: string,
    type: SuggestiontType,
  ): Promise<Suggestion> {
    const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException(`Utilisateur avec l'ID ${authorId} non trouvé`);
    }

    const suggestion = this.suggestionRepository.create({
      content,
      type,
      engineer,
      author,
    });

    return this.suggestionRepository.save(suggestion);
  }

  async findSuggestionsByEngineerId(engineerId: number): Promise<Suggestion[]> {
    const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    return this.suggestionRepository.find({
      where: { engineer: { id: engineerId } },
      relations: ['author'],
      order: { date: 'DESC' },
    });
  }

  async deleteSuggestion(suggestionId: string, userId: number): Promise<void> {
    const suggestion = await this.suggestionRepository.findOne({
      where: { id: suggestionId, author: { id: userId } },
      relations: ['author'],
    });
    if (!suggestion) {
      throw new NotFoundException(
        `Suggestion avec l'ID ${suggestionId} non trouvée ou non autorisée`,
      );
    }

    await this.suggestionRepository.delete(suggestionId);
  }
}