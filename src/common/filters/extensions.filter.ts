import { ArgumentsHost, Catch, ContextType, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { GraphQLError } from 'graphql';
import voca from 'voca';

/**
 * ExtensionPayload
 */
export interface ExtensionPayload {
  code: string;
  message: string;
  timestamp: string;
  statusCode: number;
  path?: string;
  details?: unknown;
}

@Catch()
export class ExtensionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExtensionsFilter.name);

  catch(exception: Error | HttpException, host: ArgumentsHost): Error | void {
    const requestType = host.getType<ContextType | 'graphql'>();
    const payload = this.createBasePayload(exception);

    try {
      // 处理 HTTP 异常
      if (exception instanceof HttpException) {
        this.handleHttpException(exception, payload);
      }

      // 处理 GraphQL 请求
      if (requestType === 'graphql') {
        return this.handleGraphQLError(payload);
      }

      // 处理 HTTP 请求
      if (requestType === 'http') {
        this.handleHttpError(host, payload);
        return;
      }

      this.logger.warn(`Unhandled request type: ${requestType}`);
      return exception;
    } catch (error) {
      this.logger.error(`Error in exception filter: ${error.message}`, error.stack);
      return exception;
    }
  }

  private createBasePayload(exception: Error): ExtensionPayload {
    return {
      code: voca.snakeCase(exception.name).toUpperCase(),
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      timestamp: new Date().toISOString(),
    };
  }

  private handleHttpException(exception: HttpException, payload: ExtensionPayload): void {
    try {
      const response = exception.getResponse() as Record<string, any>;
      payload.code = voca.snakeCase(response?.code || 'UNKNOWN').toUpperCase();
      payload.statusCode = exception.getStatus();
      payload.details = response?.details;
    } catch (error) {
      this.logger.error(`Error handling HttpException: ${error.message}`);
    }
  }

  private handleGraphQLError(payload: ExtensionPayload): GraphQLError {
    return new GraphQLError(payload.message, {
      extensions: {
        ...payload,
        http: { status: HttpStatus.OK },
      },
    });
  }

  private handleHttpError(host: ArgumentsHost, payload: ExtensionPayload): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    payload.path = request.url;
    response.status(payload.statusCode).json(payload);
  }
}
