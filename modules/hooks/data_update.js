export function enrichData(data = {}, extra = {}) {
      const enriched = {
            ...data,
            updatedAt: new Date().toISOString(), // সর্বদা add হবে
            delete: extra.delete || false,
      };

      // যদি create_time আগে থেকে না থাকে, তবে add করো
      if (!data.create_time) {
            enriched.createAt = new Date().toISOString();
      }

      return enriched;
}
