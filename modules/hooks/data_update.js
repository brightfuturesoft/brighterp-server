function enrichData(data = {}, extra = {}) {
  const enriched = {
    ...data,
    updatedAt: new Date().toISOString(),
    delete: extra.delete || false,
  };

  if (!data.create_time) {
    enriched.createAt = new Date().toISOString();
  }

  return enriched;
}

module.exports = { enrichData };
