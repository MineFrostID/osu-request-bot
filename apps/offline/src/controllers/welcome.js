const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { authorizeUser } = require("../services/osuAuthService.js");
const { connectBancho } = require("../services/banchoService.js");
const { loadSettings, isLogin, openBrowser } = require("./settings.js");
const config = require("../../config.json");

const port = config.port || 3000;

const welcomeMessage = async () => {
  try {
    console.info("WELCOME TO OSU! REQUEST YOUTUBE BOT!");

    if (settingCheck()) {
      try {
        if (isLogin()) {
          const setting = loadSettings();

          await authorizeUser(setting.oauth_code.username);

          await connectBancho(
            setting.oauth_code.username,
            setting.legacy_api_key,
          );

          console.info("YOU CAN NOW USE THE BOT.");
          openBrowser(port);

          return;
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    console.info("Please login to your osu! account");
    console.info(`Open this link to login: http://localhost:${port}`);
    openBrowser(port);
  } catch (error) {
    console.error("Error during welcome message initialization:", error);
  }
};

const settingCheck = () => {
  let status = true;

  const historyPath = path.join(process.cwd(), "history");
  if (!fs.existsSync(historyPath)) {
    fs.mkdirSync(historyPath);
    status = false;
  }

  // const configPath = path.join(process.cwd(), "config.json");
  // if (!fs.existsSync(configPath)) {
  //   fs.writeFileSync(configPath, "{}", "utf8");
  //   status = false;
  // }

  return status;
};

module.exports = { welcomeMessage, settingCheck };
