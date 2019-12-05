require("dotenv").config();
const app = require("./app");
const config = require("./config");

(async () => {
  try {
    await app(
      process.env.IGRACIAS_USERNAME,
      process.env.IGRACIAS_PASSWORD,
      config
    );
  } catch (err) {
    console.log(err);
  }
})();
