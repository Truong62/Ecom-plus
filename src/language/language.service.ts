import { Injectable } from '@nestjs/common';
import { CreateLanguageBodyTypes, LanguagesTypes } from './language.model';
import { LanguageRepository } from './language.repository';

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}
  create(data: CreateLanguageBodyTypes, userId: number) {
    return this.languageRepository.create(data, userId);
  }

  async findAll(): Promise<LanguagesTypes[]> {
    return await this.languageRepository.getAll();
  }

  update(id: string, data: CreateLanguageBodyTypes, userId: number) {
    return this.languageRepository.update(id, data, userId);
  }

  remove(id: string) {
    return this.languageRepository.delete(id);
  }
}
