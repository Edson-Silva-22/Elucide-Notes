import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { AuthorizationGuard } from "../../authorization.guard";
import { User } from "src/modules/users/entities/user.entity";

const mockUserModel = {
  findById: jest.fn()
}
describe('AuthorizationGuard', () => {
  let authorizationGuard: AuthorizationGuard;
  let jwtService: JwtService;
  let userModel: typeof mockUserModel;
  const createMockExecutionContext = (req: Partial<Request>) =>
  ({
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext);


  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = new JwtService({ secret: 'secret' });
    userModel = mockUserModel;
    authorizationGuard = new AuthorizationGuard(userModel as unknown as Model<User>,  jwtService);
  });

  it('should be defined', () => {
    expect(authorizationGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid admin token', async () => {
      const context = createMockExecutionContext({
        headers: {
          authorization: 'Bearer valid-admin-token',
        },
      } as unknown as Request);

      jest.spyOn(authorizationGuard, 'extractTokenFromHeader').mockReturnValue('valid-admin-token');

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 'admin-user-id' });

      userModel.findById.mockResolvedValue({ id: 'admin-user-id', isAdmin: true });

      const result = await authorizationGuard.canActivate(context);

      expect(authorizationGuard.extractTokenFromHeader).toHaveBeenCalledTimes(1);
      expect(authorizationGuard.extractTokenFromHeader).toHaveBeenCalledWith(context.switchToHttp().getRequest());

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-admin-token',
        { secret: 'secret' }
      );

      expect(userModel.findById).toHaveBeenCalledTimes(1);
      expect(userModel.findById).toHaveBeenCalledWith('admin-user-id');

      expect(result).toBe(true);
    })

    it('should throw UnauthorizedException for missing token', async () => {
      const context = createMockExecutionContext({
        headers: {},
      } as unknown as Request);

      jest.spyOn(authorizationGuard, 'extractTokenFromHeader').mockReturnValue(undefined);

      await expect(authorizationGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);

      expect(authorizationGuard.extractTokenFromHeader).toHaveBeenCalledTimes(1);
      expect(authorizationGuard.extractTokenFromHeader).toHaveBeenCalledWith(context.switchToHttp().getRequest());
    })

    it('should throw UnauthorizedException for non-admin user', async () => {
      const context = createMockExecutionContext({
        headers: {
          authorization: 'Bearer valid-user-token',
        }
      } as unknown as Request);

      jest.spyOn(authorizationGuard, 'extractTokenFromHeader').mockReturnValue('valid-user-token');

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 'regular-user-id' });

      userModel.findById.mockResolvedValue({ id: 'regular-user-id', isAdmin: false });

      await expect(authorizationGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);

      expect(authorizationGuard.extractTokenFromHeader).toHaveBeenCalledTimes(1);
      expect(authorizationGuard.extractTokenFromHeader).toHaveBeenCalledWith(context.switchToHttp().getRequest());

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-user-token',
        { secret: 'secret' }
      );

      expect(userModel.findById).toHaveBeenCalledTimes(1);
      expect(userModel.findById).toHaveBeenCalledWith('regular-user-id');
    })
  })

})