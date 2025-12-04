import 'tsconfig-paths/register';

const setUpEnv = () => {
  process.env.COMPANY_NAME = 'My Fintech App';
  process.env.COMPANY_EMAIL = 'test@test.com';
  process.env.DEFAULT_EMAIL = 'test-compamy@test.com';
  process.env.DEFAULT_PASSWORD = 'password123@';
  process.env.JWT_SECRET = 'password123@';
};

export default async () => {
  console.log('Global Test Setup Env');
  setUpEnv();
};
