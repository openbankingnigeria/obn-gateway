import { randomInt } from 'crypto';
/**
 *
 * @param length The length of the OTP you wish to generate
 */
export const generateOtp = (length: number = 6): string => {
  return Math.floor(
    1 * 10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1),
  )
    .toString()
    .padStart(length, '0');
};

export const generateRandomCode = (length: number = 6) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = randomInt(characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
};
