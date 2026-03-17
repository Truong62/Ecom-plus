import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.languageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLanguageDto) {
    return this.languageService.update(+id, updateLanguageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languageService.remove(+id);
  }
}
