import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const MyZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    console.log('Zod validation error:', error.issues);
    return new UnprocessableEntityException(
      error.issues.map((issue) => ({
        ...issue,
        path: issue.path.join('.'),
      })),
    );
  },
});

export default MyZodValidationPipe;
