export const InvalidRequest = {
    status: 400,
    jsonBody: { error: 'Invalid request body' }
}

export const ApiErrorResponse = (message: string) => ({
    status: 500,
    jsonBody: { error: message }
})