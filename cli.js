const prompts = require("prompts");
const App = require("./app");
const config = require("./config");

(async () => {
  try {
    console.log("Igracias Survey Automation");
    const questions = [
      {
        type: "text",
        name: "username",
        message: "Username:",
      },
      {
        type: "password",
        name: "password",
        message: "Password:",
      },
      {
        type: "select",
        name: "rating",
        message: "Penilaian: ",
        choices: [
          { title: "Sangat Puas", value: 0 },
          { title: "Puas", value: 1 },
          { title: "Tidak Puas", value: 2 },
          { title: "Sangat tidak Puas", value: 3 },
          { title: "10", value: 9 },
        ],
        initial: 0,
        hint: "Untuk semua penilaian",
      },
      {
        type: "text",
        name: "feedback",
        message: "Feedback:",
      },
      {
        type: "text",
        name: "gecko_path",
        message: "Gecko path: (leave blank if gecko added to PATH)",
      },
    ];
    const res = await prompts(questions);
    const { username, password } = res;

    const app = new App(username, password, config);
    await app.start();

    console.log("Done...");
  } catch (error) {
    console.log(error);
  }
})();
