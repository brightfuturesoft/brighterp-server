const { ZodError } = require('zod');

const GlobalHandler = async (error, req, res, next) => {
      process.env.NODE_ENV === 'development'
            ? console.log('globalErrorHandler', error)
            : console.log('Error from globalError', error);

      let statusCode = 500;
      let message = 'Something went wrong';
      let errorMessages = [];
      let path = req.originalUrl; // Capture the request path

      if (error?.name === 'ValidatorError') {
            const simplifiedMessage = handleValidationError(error);
            statusCode = simplifiedMessage?.statusCode;
            message = simplifiedMessage?.message;
            errorMessages = simplifiedMessage?.errorMessages;
      } else if (error instanceof ZodError) {
            const simplifiedError = handleZodError(error);
            statusCode = simplifiedError.statusCode;
            message = simplifiedError.message;
            errorMessages = simplifiedError.errorMessages;
      } else if (error?.name === 'CastError') {
            const simplifiedError = handleCastError(error);
            statusCode = simplifiedError.statusCode;
            message = simplifiedError.message;
            errorMessages = simplifiedError.errorMessages;
      } else if (error instanceof ApiError) {
            statusCode = error?.statusCode || 500;
            message = error?.message || 'An error occurred';
            errorMessages = error?.message ? [{ path: '', message: message }] : [];
      } else if (error instanceof Error) {
            message = error.message;
            errorMessages = error?.message ? [{ path: '', message: error.message }] : [];
      }

      res.status(statusCode).json({
            error: true,
            message,
            path,
            request_id: new Date().getTime(), // Use new Date() to get current timestamp
      });
};

// Error handling helpers remain unchanged

const handleValidationError = (err) => {
      const errors = Object.values(err.errors).map((element) => ({
            path: element?.path,
            message: element?.message,
      }));

      return {
            statusCode: 400,
            message: 'Validation Error',
            errorMessages: errors,
      };
};

const handleZodError = (error) => {
      const errors = error.issues.map((issue) => ({
            path: issue?.path[issue.path.length - 1],
            message: issue?.message,
      }));

      return {
            statusCode: 400,
            message: 'Validation Error from handleZodError',
            errorMessages: errors,
      };
};

const handleCastError = (error) => {
      const errors = [
            {
                  path: error.path,
                  message: error.message,
            },
      ];

      return {
            statusCode: 400,
            message: 'CastError',
            errorMessages: errors,
      };
};



class ApiError extends Error {
      statusCode;
      constructor(statusCode, message, stack = "") {
            super(message)
            this.statusCode = statusCode;
            if (stack) {
                  this.stack = stack
            }
            else {
                  Error.captureStackTrace(this, this.constructor)
            }
      }
}



module.exports = { GlobalHandler, handleValidationError, handleZodError, handleCastError };
