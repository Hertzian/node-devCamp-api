class ErrorResponse extends Error{
    constructor(message, statusCode){
        super(message);// super to call Error constructor
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;