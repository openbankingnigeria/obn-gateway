import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersController } from '@users/users.controller';
import { UsersService } from '@users/users.service';
import {
  User,
  Role,
  Company,
  Profile,
  RolePermission,
  Permission,
  AuditLog,
  Settings,
  Collection,
  CollectionRoute,
  EmailTemplate,
  TwoFaBackupCode,
  CompanyKybData,
  RoleStatuses,
  CompanyStatuses,
} from '@common/database/entities';
import { CompanyTypes } from '@common/database/constants';
import { Auth } from '@common/utils/authentication/auth.helper';
import { JwtService } from '@nestjs/jwt';
import { getTestDbConfig } from '../../test/utils/config/test-db';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let companyRepository: Repository<Company>;
  let testRole: Role;
  let testCompany: Company;
  let parentRole: Role;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          ...getTestDbConfig(),
          entities: [
            User,
            Role,
            Company,
            Profile,
            RolePermission,
            Permission,
            AuditLog,
            Settings,
            Collection,
            CollectionRoute,
            EmailTemplate,
            TwoFaBackupCode,
            CompanyKybData,
          ],
        }),
        TypeOrmModule.forFeature([
          User,
          Role,
          Company,
          Profile,
          RolePermission,
          Permission,
          AuditLog,
          Settings,
          Collection,
          CollectionRoute,
          EmailTemplate,
          TwoFaBackupCode,
          CompanyKybData,
        ]),
        EventEmitterModule.forRoot(),
      ],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: jest.fn().mockImplementation((context) => {
              const request = context.switchToHttp().getRequest();
              const mockUserRole = {
                id: 'mock-user-role-id',
                parentId: parentRole.id,
                slug: 'mock-user-role',
              };
              const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                company: testCompany,
                companyId: testCompany.id,
                role: mockUserRole,
                roleId: mockUserRole.id,
              };
              request.ctx = {
                activeUser: mockUser,
                activeCompany: testCompany,
                hasPermission: jest.fn().mockReturnValue(true),
              };
              return true;
            }),
          },
        },
        {
          provide: Auth,
          useValue: {
            verify: jest.fn().mockResolvedValue({
              userId: 'test-user-id',
              email: 'test@example.com',
              companyId: 'test-company-id',
              roleId: 'test-role-id',
            }),
            getToken: jest.fn().mockReturnValue('mock-token-123'),
            hashToken: jest.fn().mockReturnValue('mock-hashed-token-123'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn().mockReturnValue({ sub: 'test-user-id' }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    roleRepository = moduleFixture.get<Repository<Role>>(
      getRepositoryToken(Role),
    );
    companyRepository = moduleFixture.get<Repository<Company>>(
      getRepositoryToken(Company),
    );

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await app?.close();
  });

  async function setupTestData() {
    // Create test company
    testCompany = companyRepository.create({
      name: 'Test Company 4',
      status: CompanyStatuses.ACTIVE,
      type: CompanyTypes.BUSINESS,
    });
    testCompany = await companyRepository.save(testCompany);

    // Create parent role first
    parentRole = roleRepository.create({
      name: 'Parent Role',
      slug: 'parent-role',
      description: 'A parent role for testing',
      status: RoleStatuses.ACTIVE,
    });
    parentRole = await roleRepository.save(parentRole);

    // Create test role with parent
    testRole = roleRepository.create({
      name: 'Test Role',
      slug: 'test-role',
      description: 'A role for testing',
      status: RoleStatuses.ACTIVE,
      parentId: parentRole.id,
    });

    testRole = await roleRepository.save(testRole);
  }

  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      const uniqueEmail = `newuser-${Date.now()}@test.com`;
      const createUserDto = {
        email: uniqueEmail,
        roleId: testRole.id,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', 'Bearer mock-token')
        .send(createUserDto);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('email', createUserDto.email);
      expect(response.body.data).toHaveProperty('roleId', createUserDto.roleId);
    });
  });
});
