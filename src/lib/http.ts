import { IncomingHttpHeaders } from 'http'
import * as uuid from 'uuid'

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
