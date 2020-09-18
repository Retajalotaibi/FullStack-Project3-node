const crypto = require("crypto"); // a libery in node

const hashPassword = (password, salt = "secret") => {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
};

module.exports = hashPassword;
