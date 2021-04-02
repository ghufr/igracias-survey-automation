const { By } = require("selenium-webdriver");

class App {
  constructor(username, password, driver, config) {
    this.username = username;
    this.password = password;
    this.driver = driver;
    this.config = config;
    this.baseUrl = "https://igracias.telkomuniversity.ac.id";
  }

  async login() {
    const { driver, baseUrl, username, password } = this;

    await driver.get(baseUrl);
    await driver.sleep(1000);

    const js = `arguments[0].style.height='400px'; arguments[0].style.marginTop='-100px';`;

    const loginForm = await driver.findElement(By.id("ac_subitem_login"));
    await driver.executeScript(js, loginForm);

    const form = await driver.findElement(By.name("loginform"));
    await form.findElement(By.id("textUsername")).sendKeys(username);
    await form.findElement(By.id("textPassword")).sendKeys(password);

    await form.findElement(By.id("submit")).click();
  }

  async dismissAlert() {
    const { driver } = this;
    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch (err) {
      console.error(err);
    }
  }

  async start() {
    const { driver, config, baseUrl } = this;

    const start_url = `${baseUrl}/survey/index.php?pageid=${config.pageId}`;

    await this.login();
    await driver.sleep(1000);

    await this.dismissAlert();
    await driver.get(start_url);
    await driver.sleep(1000);

    await driver.get(start_url);
    const surveys = await this.getSurveyElement();

    for (let survey of surveys) {
      await this.fillSurvey(survey);
    }

    await driver.close();
  }

  async getSurveyElement() {
    const { driver } = this;
    const surveys = await driver.findElements(
      By.xpath("//*[@class='tbf2']//a")
    );
    return Promise.all(
      surveys.map((link) => link.getAttribute("href"))
    ).catch(() => []);
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
    const radios = await question.findElements(By.className("opt"));

    if (config.rating === "random") {
      const rand = Math.floor(Math.random() * radios.length);
      return radios[rand].click();
    }
    if (radios[config.rating]) {
      return radios[config.rating].click();
    }
    return radios[0].click();
  }

  async fillSurvey(survey) {
    const { driver, config } = this;

    await driver.get(survey);
    const sub_surveys = await this.getSurveyElement();

    if (sub_surveys.length > 0) {
      for (let survey of sub_surveys) {
        await this.fillSurvey(survey);
      }
    }

    const pages = await driver.findElements(
      By.xpath("//*[contains(text(), 'Part')]")
    );

    console.log(survey);

    for (let i = 0; i < pages.length; i++) {
      const questions = await driver.findElements(By.id("radioX"));

      for (let j = 0; j < questions.length; j++) {
        await this.fillMultipleChoice(questions[j]);
        await driver.sleep(10);
      }

      await this.fillTextarea(config.feedback);

      // Save
      await driver.findElement(By.xpath("//input[@class='floatL3']")).click();
    }

    // Submit
    // await driver.findElement(By.xpath("//input[@class='floatL4']")).click();
  }
}

module.exports = App;
