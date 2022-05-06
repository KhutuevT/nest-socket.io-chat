import { verify } from 'jsonwebtoken';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const ACCESS_KEY = process.env.JWT_ACCESS_KEY || '';

export const UserIdInToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const token = req.handshake.headers.authorization.split('Bearer ')[1];
    const user = verify(token, ACCESS_KEY) as { _id: string; email: string };
    return user._id;
  },
);
