require("dotenv").config();
const app = require("./app");

(async () => {
  await app(process.env.IGRACIAS_USERNAME, process.env.IGRACIAS_PASSWORD);
})();
