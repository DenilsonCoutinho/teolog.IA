export class UserNotAuthenticatedError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message)
        this.name = "UserNotAuthenticatedError"
    }
}