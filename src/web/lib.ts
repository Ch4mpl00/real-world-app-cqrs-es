export const createResponse = (body: any, status: number = 200) => ({
  body, status
})

export const createErrorResponse = (message: string, status: number) => ({
  body: {
    error: message
  },
  status
})
