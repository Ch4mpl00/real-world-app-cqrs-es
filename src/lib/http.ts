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
  return { body, status, headers: headers || [] }
}

export type ApiGatewayResponse = Promise<APIGatewayProxyResult>;

export type ApiGatewayEventBody<T = any> = {
  body: T;
  rawBody: string;
  headers: Record<string, string>
}

export type EventQuery<T> = {
  queryStringParameters: T
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
