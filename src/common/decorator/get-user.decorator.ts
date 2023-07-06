import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { authorizedUser } = ctx.switchToHttp().getRequest();

    return authorizedUser;
  },
);
