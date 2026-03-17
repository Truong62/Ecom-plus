import { createZodDto } from 'nestjs-zod';
import { CreateLanguageBody, GetAllLanguages } from './language.model';

export class GetAllLanguagesDTO extends createZodDto(GetAllLanguages) {}
export class CreateLanguageDTO extends createZodDto(CreateLanguageBody) {}
