import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../shared/prisma.service';
import { CreateLanguageBodyTypes, LanguagesTypes } from './language.model';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getAll(): Promise<LanguagesTypes[]> {
    return this.prismaService.language.findMany();
  }
  create(data: CreateLanguageBodyTypes, userId: number) {
    return this.prismaService.language.create({
      data: {
        id: uuidv4().slice(0, 9),
        ...data,
        createdById: userId,
      },
    });
  }

  update(id: string, data: CreateLanguageBodyTypes, userId: number) {
    return this.prismaService.language.update({
      where: { id },
      data: {
        ...data,
        updatedById: userId,
      },
    });
  }

  delete(id: string) {
    return this.prismaService.language.delete({ where: { id } });
  }
}
