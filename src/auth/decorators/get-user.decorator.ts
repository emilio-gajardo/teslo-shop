import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {

    // console.log({ ctx });

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    const email = req.user.email;

    if (!data)
      return user;

    else if (data)
      return email;

    else if (!user)
      throw new InternalServerErrorException('User not found (request)');

  }
);