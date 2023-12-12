/**
 *
 * @param length The length of the OTP you wish to generate
 */
export const generateOtp = (length: number) => {
  return Math.floor(
    1 * 10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1),
  );
};
