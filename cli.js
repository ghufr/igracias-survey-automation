const prompts = require("prompts");
const app = require("./app");

(async () => {
  try {
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
      },
      {
        type: "select",
        name: "rating",
        message: "Penilaian: ",
        choices: [
          { title: "Sangat Puas", value: 0 },
          { title: "Puas", value: 1 },
          { title: "Tidak Puas", value: 2 },
          { title: "Sangat tidak Puas", value: 3 }
        ],
        initial: 0,
        hint: "Untuk semua penilaian"
      },
      {
        type: "text",
        name: "feedback",
        message: "Feedback:"
      },
      {
        type: "text",
        name: "gecko_path",
        message: "Gecko path: (leave blank if gecko added to PATH)",
        initial: "./bin/geckodriver.exe"
      }
    ];
    const res = await prompts(questions);
    const { username, password, ...config } = res;
    await app(username, password, { ...config, pageId: 2001 });
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
})();
