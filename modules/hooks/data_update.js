// hooks/data_update.js

// enriches payload with timestamps and extra fields
function enrichData(data = {}, extra = {}) {
  const enriched = {
    ...data,
    updatedAt: new Date().toISOString(),
    delete: extra.delete || false,
  };

  if (!data.createAt) {
    enriched.createAt = new Date().toISOString();
  }

  return enriched;
}

// standard API response wrapper
function response_sender({ res, status_code = 200, error = false, data = null, message = "" }) {
  return res.status(status_code).json({
    error,
    data,
    message,
  });
}

module.exports = {
  enrichData,
  response_sender,
};
