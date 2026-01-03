import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationException } from '../exceptions';

export const ValidatedBody = (DtoClass: new () => any) =>
  createParamDecorator(
    async (_: unknown, context: ExecutionContext) => {
      const data = context.switchToRpc().getData();

      if (!data?.body) {
        throw new ValidationException('Request body is missing');
      }

      const dto = plainToInstance(DtoClass, data.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        // Build detailed validation errors
        const validationErrors: Record<string, string[]> = {};
        
        errors.forEach(error => {
          if (error.constraints) {
            validationErrors[error.property] = Object.values(error.constraints);
          }
          if (error.children && error.children.length > 0) {
            error.children.forEach(child => {
              if (child.constraints) {
                validationErrors[`${error.property}.${child.property}`] = Object.values(child.constraints);
              }
            });
          }
        });

        throw new ValidationException(
          'Validation failed',
          { validationErrors }
        );
      }

      return dto;
    },
  )();
