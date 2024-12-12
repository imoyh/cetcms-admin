import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    const { method, baseUrl, body } = req;
    if (baseUrl === '/graphql') {
      const { variables, operationName } = body;
      const variablesString = JSON.stringify(variables);
      this.logger.log(`GraphQL: <${operationName}> - ${variablesString};`);
    } else {
      const bodyString = JSON.stringify(body);
      this.logger.log(`Request: <${method}, ${baseUrl || '/'}> - ${bodyString};`);
    }
    next();
  }
}
