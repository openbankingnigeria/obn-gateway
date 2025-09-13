import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@users/users.controller';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { createMockContext, createMockResponse } from '@utils/mocks';
import { PERMISSIONS } from '@permissions/types';
import { UserStatuses } from '@common/database/entities';
import { UpdateUserDto } from '@users/dto/index.dto';
import { CompanyBuilder, RoleBuilder, UserBuilder } from '@test/utils/builders';
import { userSuccessMessages } from '@users/user.constants';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { UsersService } from './users.service';

const moduleMocker = new ModuleMocker(global);

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: jest.Mocked<any>;
  let ctx: ReturnType<typeof createMockContext>;

  beforeEach(async () => {
    ctx = createMockContext({
      permissions: [PERMISSIONS.ADD_TEAM_MEMBERS, PERMISSIONS.LIST_TEAM_MEMBERS],
      user: new UserBuilder()
        .with("company", new CompanyBuilder().build())
        .with("role", new RoleBuilder().build())
        .build()
    });

    mockUsersService = {
      createUser: jest.fn(),
      resendInvite: jest.fn(),
      listUsers: jest.fn(),
      getStats: jest.fn(),
      getUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const testUser = new UserBuilder().build();
    const testRole = new RoleBuilder().build();

    // Mock implementations using createMockResponse
    mockUsersService.createUser.mockImplementation((_ctx: any, dto: any) => {
      const mockRes = createMockResponse();
      mockRes.json(ResponseFormatter.success(
        userSuccessMessages.createdUser,
        { ...dto, id: 'new-user-id' }
      ));
      return Promise.resolve(mockRes.body);
    });

    mockUsersService.resendInvite.mockImplementation((_ctx: any, id: any) => {
      const mockRes = createMockResponse();
      mockRes.json(ResponseFormatter.success(
        userSuccessMessages.sentInvite,
        { id, email: 'test@example.com' }
      ));
      return Promise.resolve(mockRes.body);
    });

    mockUsersService.listUsers.mockImplementation((_ctx: any, pagination: { page: any; limit: any; }, _filters: any) => {
      const mockRes = createMockResponse();
      mockRes.json(ResponseFormatter.success(
        userSuccessMessages.fetchedUsers,
        [{ id: 'user1' }, { id: 'user2' }],
        {
          totalNumberOfRecords: 2,
          totalNumberOfPages: 1,
          pageNumber: pagination.page,
          pageSize: pagination.limit,
        }
      ));
      return Promise.resolve(mockRes.body);
    });

    mockUsersService.getStats.mockImplementation((_ctx: any) => {
      const mockRes = createMockResponse();
      mockRes.json(ResponseFormatter.success(
        userSuccessMessages.fetchedUsersStats,
        [
          { count: 5, value: UserStatuses.ACTIVE },
          { count: 2, value: UserStatuses.PENDING },
        ]
      ));
      return Promise.resolve(mockRes.body);
    });

    mockUsersService.getUser.mockImplementation((_ctx: any, id: any) => {
      const mockRes = createMockResponse();
      mockRes.json(ResponseFormatter.success(
        userSuccessMessages.fetchedUser,
        { id, email: 'test@example.com' }
      ));
      return Promise.resolve(mockRes.body);
    });

    mockUsersService.updateUser.mockImplementation((_ctx: any, id: any, dto: any) => {
      const mockRes = createMockResponse();
      mockRes.json(ResponseFormatter.success(
        userSuccessMessages.updatedUser,
        { id, ...dto }
      ));
      return Promise.resolve(mockRes.body);
    });

    mockUsersService.deleteUser.mockImplementation((_ctx: any, _id: any) => {
      const mockRes = createMockResponse();
      mockRes.json(ResponseFormatter.success(
        userSuccessMessages.deletedUser,
        null
      ));
      return Promise.resolve(mockRes.body);
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return mockUsersService;
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const role = new RoleBuilder().build();
      const createUserDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User', 
        roleId: role.id!
      };

      const result = await controller.createUser(ctx.ctx, createUserDto);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual({
        status: 'success',
        message: userSuccessMessages.createdUser,
        data: {
          ...createUserDto,
          id: 'new-user-id'
        }
      });
      expect(mockUsersService.createUser).toHaveBeenCalledWith(ctx.ctx, createUserDto);
    });
  });

  describe('resendInvite', () => {
    it('should resend invite successfully', async () => {
      const userId = 'test-user-id';

      const result = await controller.resendInvite(ctx.ctx, userId);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual({
        status: 'success',
        message: userSuccessMessages.sentInvite,
        data: {
          id: userId,
          email: 'test@example.com'
        }
      });
      expect(mockUsersService.resendInvite).toHaveBeenCalledWith(ctx.ctx, userId);
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { search: 'test' };

      const result = await controller.listUsers(ctx.ctx, pagination, filters);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual({
        status: 'success',
        message: userSuccessMessages.fetchedUsers,
        data: [{ id: 'user1' }, { id: 'user2' }],
        meta: {
          totalNumberOfRecords: 2,
          totalNumberOfPages: 1,
          pageNumber: 1,
          pageSize: 10
        }
      });
      expect(mockUsersService.listUsers).toHaveBeenCalledWith(
        ctx.ctx,
        pagination,
        filters
      );
    });
  });

  describe('getStats', () => {
    it('should get user stats successfully', async () => {
      const result = await controller.getStats(ctx.ctx);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual({
        status: 'success',
        message: userSuccessMessages.fetchedUsersStats,
        data: [
          { count: 5, value: UserStatuses.ACTIVE },
          { count: 2, value: UserStatuses.PENDING },
        ]
      });
      expect(mockUsersService.getStats).toHaveBeenCalledWith(ctx.ctx);
    });
  });

  describe('getUser', () => {
    it('should get user by id successfully', async () => {
      const userId = 'test-user-id';

      const result = await controller.getUser(ctx.ctx, userId);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual({
        status: 'success',
        message: userSuccessMessages.fetchedUser,
        data: {
          id: userId,
          email: 'test@example.com'
        }
      });
      expect(mockUsersService.getUser).toHaveBeenCalledWith(ctx.ctx, userId);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'test-user-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User', 
        roleId: 'role-id', 
        status: UserStatuses.ACTIVE 
      };

      const result = await controller.updateUser(ctx.ctx, userId, updateUserDto);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual({
        status: 'success',
        message: userSuccessMessages.updatedUser,
        data: {
          id: userId,
          ...updateUserDto
        }
      });
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(
        ctx.ctx,
        userId,
        updateUserDto
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'test-user-id';

      const result = await controller.deleteUser(ctx.ctx, userId);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual({
        status: 'success',
        message: userSuccessMessages.deletedUser,
        data: null
      });
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(ctx.ctx, userId);
    });
  });
});