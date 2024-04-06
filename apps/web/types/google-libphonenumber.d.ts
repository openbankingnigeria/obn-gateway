declare module 'google-libphonenumber' {
  export class PhoneNumberUtil {
    static getInstance(): PhoneNumberUtil;
    parse(phoneNumber: string, region: string): any;
    isValidNumber(phoneNumber: any): boolean;
  }
}
