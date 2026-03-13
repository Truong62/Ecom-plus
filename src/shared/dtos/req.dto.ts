import { createZodDto } from 'nestjs-zod';
import { EmptyBodySchema } from '../models/req.nodel';

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
