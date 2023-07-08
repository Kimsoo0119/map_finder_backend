import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAuthorizedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { authorizedUser } = ctx.switchToHttp().getRequest();

    return authorizedUser;
  },
);
