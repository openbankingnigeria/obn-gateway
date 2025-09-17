// Mock expensive operations
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => 
    Promise.resolve(hash === `hashed_${password}`)
  ),
}));

// Mock speakeasy for 2FA
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(() => ({
    base32: 'MOCK2FASECRET123456789012345678',
    otpauth_url: 'otpauth://totp/Test?secret=MOCK2FASECRET123456789012345678'
  })),
  otpauthURL: jest.fn(({ label, secret }) => 
    `otpauth://totp/${label}?secret=${secret}`
  ),
  totp: {
    verify: jest.fn(() => true) 
  }
}));

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mockedQRCodeData'))
}));