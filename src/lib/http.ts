import { IncomingHttpHeaders } from 'http'
import * as uuid from 'uuid'
import { APIGatewayProxyResult } from 'aws-lambda';

export type HttpResponseBag = {
  readonly body: object,
  readonly status: number,
  readonly headers: ReadonlyArray<object>
}

type ParsedQueryString = {
  readonly [key: string]:
    | undefined
    | string
    | ReadonlyArray<string>
    | ReadonlyArray<ParsedQueryString>
    | ParsedQueryString
}

export type HttpRequestBag = {
  readonly body: object,
  readonly params: { readonly [key: string]: string | undefined }
  readonly method: string
  readonly query: ParsedQueryString
  readonly headers: IncomingHttpHeaders
  readonly requestId: string
}

export const createHttpResponseBag = (
  body: object,
  status: number,
  headers: ReadonlyArray<object> | undefined = undefined
): HttpResponseBag => {
  return { body, status, headers: headers || [] }
}

export const createHttpRequestBag = (
  body: object,
  params: { readonly [key: string]: string | undefined },
  method: string,
  query: ParsedQueryString,
  headers: IncomingHttpHeaders
): HttpRequestBag => {
  return { body, params, method, query, headers, requestId: uuid.v4() }
}

export type ApiGatewayResponse = Promise<APIGatewayProxyResult>;

export type Identity = {
  authorizer: {
    principalId: string;
    pkey: string;
    Username: string;
    auth0Id: string;
    email: string;
    phoneNumber?: string;
    isTFAEnabled: boolean;
  }
}

export type TFA = {
  isTFAEnabled: boolean;
  phoneNumber?: string;
}

export type InternalEventType = {
  internal: TFA
}

export type EventRequestContext<T> = {
  requestContext: T
}

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
