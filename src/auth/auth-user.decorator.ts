import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";

export const AuthUser = createParamDecorator((data :never ,context :ExecutionContext) => {
  return context.switchToHttp().getRequest().user
})
