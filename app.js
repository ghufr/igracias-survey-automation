const { Builder, By } = require("selenium-webdriver");
const { ServiceBuilder } = require("selenium-webdriver/firefox");
// const path = require("path");

const getRawLinks = links => {
  const promises = links.map(async link => {
    return await link.getAttribute("href").catch(() => { });
  });
  return Promise.all(promises);
};

const fillSurvey = async (links, driver, config) => {
  for (link of links) {
    await driver.get(link);

    const hlm = await driver.findElements(By.className("hlm1"));
    for (let i = 0; i < hlm.length; i++) {
      const question = await driver.findElements(
        By.xpath("//*[contains(@id, 'radio')]")
      );
      // Question each part
      for (let index = 0; index < question.length; index++) {
        await question[index]
          .findElements(By.tagName("input"))
          .then(async radio => {
            await radio[config.rating].click();
          })
          .catch(() => { });
      }
      await driver.findElement(By.xpath("//*[@value='simpan']")).click();

      // Search for textbox
      const textBoxs = await driver.findElements(By.tagName("textarea"));
      for (textbox of textBoxs) {
        await textbox.clear();
        await textbox.sendKeys(config.feedback);
      }
    }
    await driver.findElement(By.xpath("//*[@value='simpan']")).click();
  }
  await driver.findElement(By.xpath("//input[@class='floatL4']")).click();
};

async function app(username, password, config) {
  let driver = await new Builder().forBrowser("firefox");
  try {
    if (config.gecko_path) {
      const serviceBuilder = new ServiceBuilder(config.gecko_path);
      driver = await driver.setFirefoxService(serviceBuilder).build();
    } else {
      driver = await driver.build();
    }

    // let options = new S.Options().setBinary(config.gecko_path);

    // let driver = await new Builder()
    //   .setFirefoxOptions(options)
    //   .forBrowser("firefox")
    //   .build();
    const baseUrl = "https://igracias.telkomuniversity.ac.id";
    let surveyPath = `survey/index.php?pageid=${config.pageId}`;
    const surveyUrl = `${baseUrl}/${surveyPath}`;
    await driver.get(baseUrl);
    await driver.sleep(2000);

    // Password Login
    const styl = "arguments[0].style";
    const js = `${styl}.height='400px'; ${styl}.marginTop='-100px';`;

    const login_form = await driver.findElement(By.id("ac_subitem_login"));
    await driver.executeScript(js, login_form);

    const form = await driver.findElement(By.name("loginform"));
    await form.findElement(By.id("textUsername")).sendKeys(username);
    await form.findElement(By.id("textPassword")).sendKeys(password);
    // return;
    await form.findElement(By.id("submit")).click();
    await driver.sleep(5000);
    await driver.get(surveyUrl);
    // Anti alert
    driver.switchTo().alert().accept();

    let survey_url = []
    if (config.single) {
      survey_url = [surveyUrl]
    } else {
      const surveys = await driver.findElements(By.xpath("//*[@id='form1']//a"));
      survey_url = await getRawLinks(surveys);
    }

    for (survey of survey_url) {
      await driver.get(survey);

      const isSurvey = await driver.findElements(By.className("hlm2"));

      if (isSurvey.length > 0) {
        // Fill Survey
        await fillSurvey([survey], driver, config);
      } else {
        // There still a menu
        const lectures = await driver.findElements(
          By.xpath("//*[@id='form1']//a")
        );
        const lectures_url = await getRawLinks(lectures);
        await fillSurvey(lectures_url, driver, config);
        // await driver.get(survey);
      }
      await driver.close();
    }
  } catch (e) {
    console.log("Something went wrong");
    console.log(e);
    driver.close();
  }
}

module.exports = app;
