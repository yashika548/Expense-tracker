exports.up = (pgm) => {
  pgm.createIndex("transactions", ["user_id", "type", { name: "date", sort: "DESC" }], {
    name: "idx_transactions_user_type_date",
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("transactions", "idx_transactions_user_type_date");
};