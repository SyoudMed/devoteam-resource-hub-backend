import { IsString, IsEnum } from 'class-validator';
import { SuggestiontType } from '../entities/Suggestion.entity';

export class CreateSuggestionDto {
  @IsString()
  content: string;

  @IsEnum(SuggestiontType)
  type: SuggestiontType;
}