import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { LanguageService } from './language.service';
import { LanguagesTypes } from './language.model';
import { CreateLanguageDTO } from './language.dto';
import { ActiveUser } from '../shared/decorators/active-user.decorator';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  create(@Body() data: CreateLanguageDTO, @ActiveUser('userId') userId: number) {
    return this.languageService.create(data, userId);
  }

  @Get()
  findAll(): Promise<LanguagesTypes[]> {
    return this.languageService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: CreateLanguageDTO, @ActiveUser('userId') userId: number) {
    return this.languageService.update(id, data, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languageService.remove(id);
  }
}
