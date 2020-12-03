require("dotenv").config();
const { Builder } = require("selenium-webdriver");
const { ServiceBuilder } = require("selenium-webdriver/firefox");

const App = require("./app");
const config = require("./config");

(async () => {
  try {
    let driver = await new Builder().forBrowser("firefox");

    if (config.gecko_path) {
      const serviceBuilder = new ServiceBuilder(config.gecko_path);
      driver = await driver.setFirefoxService(serviceBuilder).build();
    } else {
      driver = await driver.build();
    }

    const app = new App(
      process.env.IGRACIAS_USERNAME,
      process.env.IGRACIAS_PASSWORD,
      driver,
      config
    );
    await app.start();
    console.log("Done...");
  } catch (err) {
    console.log(err);
  }
})();
