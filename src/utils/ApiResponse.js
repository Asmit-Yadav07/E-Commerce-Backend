class ApiResponse extends Error {
    constructor(
        statuscode,
        data,
        message = "Success"
    ) {
        this.stauscode = statuscode,
            this.data = data,
            this.success = statuscode < 400,
            this.message = message
    }
}

export { ApiResponse }