const response_sender = ({ res, status_code, error, data, message }) => {


      const response = {
            error: error ?? false,
            message: message || "",
            request_id: new Date().getTime(),
      };
      if (status_code !== null && status_code !== undefined) {
            response.status_code = status_code;
      }

      if (data !== null && data !== undefined) {
            response.data = data;
      }
      res.status(status_code || 200).json(response);
};


module.exports = { response_sender };
