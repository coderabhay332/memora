import crypto from 'crypto';

export const generateDeterministicId = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};






