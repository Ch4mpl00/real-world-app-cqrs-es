export type ResponseBag = {
  readonly body: any,
  readonly status: number
}

export const createResponse = (body: any, status: number = 200): ResponseBag => ({
  body, status
})

export const createErrorView = (message: string) => ({
  error: message
})
