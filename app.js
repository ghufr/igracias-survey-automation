const { By } = require("selenium-webdriver");

class App {
  baseUrl = "https://igracias.telkomuniversity.ac.id";

  constructor(username, password, driver, config) {
    this.username = username;
    this.password = password;
    this.driver = driver;
    this.config = config;
  }

  async login() {
    const { driver, baseUrl, username, password } = this;

    await driver.get(baseUrl);
    await driver.sleep(2000);

    const js = `arguments[0].style.height='400px'; arguments[0].style.marginTop='-100px';`;

    const loginForm = await driver.findElement(By.id("ac_subitem_login"));
    await driver.executeScript(js, loginForm);

    const form = await driver.findElement(By.name("loginform"));
    await form.findElement(By.id("textUsername")).sendKeys(username);
    await form.findElement(By.id("textPassword")).sendKeys(password);

    await form.findElement(By.id("submit")).click();
    await driver.sleep(2000);
  }

  async dismissAlert() {
    const { driver } = this;
    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch (err) {}
  }

  async start() {
    const { driver } = this;

    await this.login();
    await this.dismissAlert();
    const surveys = await this.getSurveyUrl();
    for (let survey of surveys) {
      await this.fillSurvey(survey);
    }

    await driver.close();
  }

  async getSurveyUrl() {
    const { driver, baseUrl, config } = this;

    await driver.get(`${baseUrl}/survey/index.php?pageid=${config.pageId}`);
    const surveys = await driver.findElements(By.xpath("//*[@id='form1']//a"));
    return Promise.all(surveys.map((link) => link.getAttribute("href")));
  }

  async fillTextarea(feedback) {
    const { driver } = this;
    const textareas = await driver.findElements(By.css("textarea"));
    if (textareas && textareas.length > 0) {
      for (let textarea of textareas) {
        await textarea.clear();
        await textarea.sendKeys(feedback);
      }
    }
  }

  async fillMultipleChoice(question) {
    const { config } = this;

    // How many choice are there
    const radios = await question.findElements(By.css("input"));

    if (radios[config.rating]) {
      return radios[config.rating].click();
    }
    return radios[0].click();
  }

  async fillSurvey(survey) {
    const { driver, config } = this;

    await driver.get(survey);
    const pages = await driver.findElements(
      By.xpath("//*[contains(text(), 'Part')]")
    );

    console.log(survey);
    console.log("Total Halaman: ", pages.length);

    for (let i = 0; i < pages.length; i++) {
      const questions = await driver.findElements(By.id("radioX"));

      for (let index = 0; index < questions.length; index++) {
        await this.fillMultipleChoice(questions[i]);
      }

      await this.fillTextarea(config.feedback);

      // Save
      await driver.findElement(By.xpath("//input[@class='floatL3']")).click();
    }

    // Submit
    await driver
      .findElement(By.xpath("//input[@src='../images/btn_submit.gif']"))
      .click();
  }
}

module.exports = App;
