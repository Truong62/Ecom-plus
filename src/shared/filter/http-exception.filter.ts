import {
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    let httpException;

    switch (exception.code) {
      case 'P2002': {
        const fields = exception.meta?.target as string[] | undefined;

        httpException = new ConflictException({
          code: 'UNIQUE_CONSTRAINT_FAILED',
          fields,
          message: fields ? `Duplicate value for field(s): ${fields.join(', ')}` : 'Duplicate value',
        });
        break;
      }

      case 'P2025': {
        httpException = new NotFoundException({
          code: 'RECORD_NOT_FOUND',
          message: 'Record not found',
        });
        break;
      }

      default: {
        httpException = new InternalServerErrorException({
          code: 'PRISMA_ERROR',
          prismaCode: exception.code,
          message: exception.message,
        });
      }
    }

    throw httpException;
  }
}
