import { randomInt } from 'crypto';

export const genCodeOTP = () => randomInt(100000, 999999).toString();
