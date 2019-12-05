require("dotenv").config();
const { Builder, By } = require("selenium-webdriver");
const constants = require("./constants");

const getRawLinks = links => {
  const promises = links.map(async link => {
    return await link.getAttribute("href").catch(() => {});
  });
  return Promise.all(promises);
};

const fillSurvey = async (links, driver) => {
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
            await radio[constants.multiple_choice].click();
          })
          .catch(() => {});
      }
      await driver.findElement(By.xpath("//*[@value='simpan']")).click();

      // Search for textbox
      const textBoxs = await driver.findElements(By.tagName("textarea"));
      for (textbox of textBoxs) {
        await textbox.clear();
        await textbox.sendKeys(constants.feedback);
      }
    }
    await driver.findElement(By.xpath("//*[@value='simpan']")).click();
  }
  await driver.findElement(By.xpath("//input[@class='floatL4']")).click();
};

(async function main() {
  let driver = await new Builder().forBrowser("firefox").build();
  const pageid = 2001;

  try {
    const baseUrl = "https://igracias.telkomuniversity.ac.id";
    let surveyPath = `survey/index.php?pageid=${pageid}`;
    const surveyUrl = `${baseUrl}/${surveyPath}`;
    // const domain = ".igracias.telkomuniversity.ac.id";
    await driver.get(baseUrl);
    await driver.sleep(2000);

    // Password Login
    const styl = "arguments[0].style";
    const js = `${styl}.height='400px'; ${styl}.marginTop='-100px';`;

    const login_form = await driver.findElement(By.id("ac_subitem_login"));
    await driver.executeScript(js, login_form);

    // await login_menu.findElement(By.id("login_button_general")).click();

    const form = await driver.findElement(By.name("loginform"));
    await form
      .findElement(By.id("textUsername"))
      .sendKeys(process.env.IGRACIAS_USERNAME);
    await form
      .findElement(By.id("textPassword"))
      .sendKeys(process.env.IGRACIAS_PASSWORD);
    // return;
    await form.findElement(By.id("submit")).click();
    await driver.sleep(1000);
    await driver.get(surveyUrl);

    const surveys = await driver.findElements(By.xpath("//*[@id='form1']//a"));
    const survey_url = await getRawLinks(surveys);

    for (survey of survey_url) {
      await driver.get(survey);

      const isSurvey = await driver.findElements(By.className("hlm2"));

      if (isSurvey.length > 0) {
        // Fill Survey
        await fillSurvey([survey], driver);
      } else {
        // There still a menu
        const lectures = await driver.findElements(
          By.xpath("//*[@id='form1']//a")
        );
        const lectures_url = await getRawLinks(lectures);
        await fillSurvey(lectures_url, driver);
        // await driver.get(survey);
      }
    }
  } catch (e) {
    console.log(e);
  }
})();
