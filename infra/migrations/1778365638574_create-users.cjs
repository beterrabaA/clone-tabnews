exports.up = async (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuidv7()"),
    },
    // for reference, GitHub's limit for username length is 39 characters, but we'll use 30 to be safe and allow for future changes.
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    // We'll use 254 characters for email, which is the maximum length of an email address as per RFC 5321. Ref: https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    // For password, since we'll be storing a hashed version, we can set a fixed length. A common hash output (like bcrypt) is 60 characters long. Ref: https://www.npmjs.com/package/bcrypt#hash-info
    password: {
      type: "varchar(60)",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp(2)"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp(2)"),
    },
  });
};

exports.down = async (pgm) => {
  pgm.dropTable("users");
};
