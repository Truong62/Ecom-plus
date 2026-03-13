import { UnprocessableEntityException } from '@nestjs/common';

export const TOTPAlreadyEnabledException = new UnprocessableEntityException([
  {
    message: 'Error.totpAlreadyEnabled',
    path: 'totpCode',
  },
]);

export const TOTPNotAlreadyEnabledException = new UnprocessableEntityException([
  {
    message: 'Error.notAlreadyEnabled',
    path: 'totpCode',
  },
]);

export const InvalidTOTPCodeException = new UnprocessableEntityException([
  {
    message: 'Error.invalidTOTPCode',
    path: 'totpCode',
  },
  {
    message: 'Error.invalidTOTPCode',
    path: 'code',
  },
]);
