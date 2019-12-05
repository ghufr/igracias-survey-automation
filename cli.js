const prompts = require("prompts");
const app = require("./app");

(async () => {
  console.log("Igracias Survey Automation");
  const questions = [
    {
      type: "text",
      name: "username",
      message: "Username:"
    },
    {
      type: "password",
      name: "password",
      message: "Password:"
    }
  ];
  const res = await prompts(questions);
  await app(res.username, res.password);
})();
