import { APIGatewayProxyResult } from 'aws-lambda';

export type HttpResponseBag = {
  readonly body: object,
  readonly status: number,
  readonly headers: ReadonlyArray<object>
}

export const createHttpResponseBag = (
  body: object,
  status: number,
  headers: ReadonlyArray<object> | undefined = undefined
): HttpResponseBag => {
  return { body, status, headers: headers || [] };
};

export type ApiGatewayResponse = Promise<APIGatewayProxyResult>;

export type EventRequestContext = {
  requestContext: {
    authorizer: {
      principalId: string;
    }
  }
}

export type ApiGatewayEventBody<T = any> = {
  body: T;
  rawBody: string;
  headers: Record<string, string>,
} & EventRequestContext

export type EventQuery<T extends {}> = {
  queryStringParameters: T
}

export type PaginatedEventQuery<T extends {} = {}> = {
  queryStringParameters: T & { limit: number, offset: number }
}

export type EventPath<T> = {
  pathParameters: T
}

export type EventHeader<T> = {
  headers: T
}

export type ProxyHeader = {
  authorization: string;
}
