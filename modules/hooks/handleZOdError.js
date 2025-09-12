/* eslint-disable no-console */
const { ZodError } = require('zod');
const { response_sender } = require('./respose_sender');

const handleZodError = (res, error) => {
      if (error instanceof ZodError) {
            const errors = error.issues.map((issue) => ({
                  path: issue?.path[issue.path.length - 1],
                  message: issue?.message,
            }));
            response_sender({
                  res,
                  status_code: 400,
                  error: true,
                  message: 'Validation Error',
                  data: { errorMessages: errors }
            });
      } else {
            response_sender({
                  res,
                  status_code: 500,
                  error: true,
                  message: error.message || 'Something went wrong'
            });
      }
};

module.exports = { handleZodError };
