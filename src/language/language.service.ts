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

  findOne(id: number) {
    return `This action returns a #${id} language`;
  }

  update(id: number, updateLanguageDto) {
    return `This action updates a #${id} language`;
  }

  remove(id: number) {
    return `This action removes a #${id} language`;
  }
}
