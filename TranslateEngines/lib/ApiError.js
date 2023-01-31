
class ApiError extends Error {
    constructor(message,code) {
        super()
        this.message = message;
        this.code = code;
        this.name = 'ApiError';
    }
}

module.exports= ApiError;