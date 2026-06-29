class ApiResponse {
    constructor(statusCode,data,message="success"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode < 400
    }
}

// statusCode is 3digit error code to request  (not response, success,fail,need more stapes)