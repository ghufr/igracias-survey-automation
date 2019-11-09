require('dotenv').config();
const { Builder, By } = require('selenium-webdriver');

const getRawLinks = (lectures) => {
  const promises = lectures.map(async (lecture, i) => {
    if (i > 0) {
      return await lecture.findElement(By.tagName('a')).getAttribute('href').catch(() => {});
    }
  });
  return Promise.all(promises);
}

const getIds = (elements) => {
  const promises = elements.map(async (element) => {
    return await element.getLocation();
  });
  return Promise.all(promises);
}

(async function main() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
    const baseUrl = 'https://igracias.telkomuniversity.ac.id';
    let surveyPath = '/survey/index.php?pageid=2001&QID=3056';
    const domain = '.igracias.telkomuniversity.ac.id';
    await driver.get(baseUrl);

    const PHPSESSID = process.env.PHPSESSID;
    // const BIGipServerpool = '3002924042.20480.0000';

    await driver.manage().addCookie({ name: 'BIGipServerpool_iGracias', value: BIGipServerpool, domain, httpOnly: true, secure: true })
    await driver.manage().addCookie({ name: 'PHPSESSID', value: PHPSESSID, domain })
    await driver.get(baseUrl + surveyPath)
    const lectures = await driver.findElements(By.xpath("//*[@id='form1']/table/tbody/child::tr"));

    const rawLink = await getRawLinks(lectures);
    for(link of rawLink) {
      if (link) {
        await driver.get(link)
        for(let i = 0; i < 2; i++) {
          const question = await driver.findElements(By.xpath("//*[contains(@id, 'radio')]"));
          for (let index = 0; index < 10; index++) {
            await question[index].findElements(By.tagName('input')).then(async (radio) => {
              await radio[0].click();
            }).catch(() => {});
          }
          await driver.findElement(By.xpath("//*[@value='simpan']")).click();
        }
        const textBox = await driver.findElement(By.tagName('textarea'));
        await textBox.clear();
        await textBox.sendKeys('Saran dan survey ini sepenuhnya dibuat secara otomatis oleh software, saya sedang melakukan uji coba software pengisi survey igracias secara otomatis :)')
        await driver.findElement(By.xpath("//*[@value='simpan']")).click();
      }
    }
    await driver.get(baseUrl + surveyPath);
    const submits = await driver.findElement(By.xpath("//*[contains(@href, 'APPLY')]"));
    const ids = await getIds(submits);
    for (id of ids) {
      await driver.findElement(id).click();
    }
  } catch(e) {
    console.log(e)
  }
})();