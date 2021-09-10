import {
    ValidationError,
    ValidationPipe,
    ValidationPipeOptions,
    ArgumentMetadata,
    UnprocessableEntityException,
  } from '@nestjs/common';
  
  export class DefaultValidationPipe extends ValidationPipe {
    constructor(overwriteDefaultOptions: ValidationPipeOptions = {}) {
      super({
        transform: true,
        forbidUnknownValues: true,
        whitelist: true,
        validationError: { target: false },
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors: ValidationError[]) => {
          const args = { param: [] as any, message: [] as any };
          transformErrors(args, errors);
          return new UnprocessableEntityException(args);
        },
        ...overwriteDefaultOptions,
      });
    }
  
    async transform(value: any, metadata: ArgumentMetadata): Promise<void> {
      if (metadata.metatype && (metadata.metatype as any).transformer) {
        value = (metadata.metatype as any).transformer(value);
      }
  
      return await super.transform(value, metadata);
    }
  }
  
  function transformErrors(
    args: { param: any[]; message: any[] },
    errors: ValidationError[],
    parentProperty = '',
  ) {
    for (let error of errors) {
      const property = parentProperty
        ? `${parentProperty}.${error.property}`
        : error.property;
      if (error.constraints) {
        args.message.push(error.constraints);
        args.param.push(property);
      }
      if (error.children && error.children.length > 0) {
        transformErrors(args, error.children, property);
      }
    }
  }
  