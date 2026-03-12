const port = process.env.PORT || 3000;
const fs = require("fs");
const path = require("path");
const osuAuthService = require("../services/osuAuthService");
const banchoService = require("../services/banchoService");
const welcomeMessage = async () => {
  try {
    console.info("WELCOME TO OSU! REQUEST YOUTUBE BOT!");

    if (settingCheck()) {
      try {
        const settingPath = path.join(process.cwd(), "./setting.json");
        let setting = {};

        const rawData = fs.readFileSync(settingPath, "utf8");
        setting = JSON.parse(rawData);

        if (setting.oauth_code && setting.legacy_api_key) {
          await osuAuthService.authorizeUser(setting.oauth_code.username);
          await banchoService.connectBancho(
            setting.oauth_code.username,
            setting.legacy_api_key,
          );

          return console.info("YOU CAN NOW USE THE BOT.");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        return;
      }
    }
    console.info("Please login to your osu! account");
    console.info("Open this link to login:");
    console.info("http://localhost:" + port + "/login");
  } catch (error) {
    console.error("Error during welcome message initialization:", error);
  }
};

const settingCheck = () => {
  const settingPath = path.join(process.cwd(), "./setting.json");
  let status = true;
  if (!fs.existsSync(settingPath)) {
    fs.writeFileSync(settingPath, "{}", "utf8");
    status = false;
  }

  // NOT USING IT FOR NOW
  // const logsPath = path.join(process.cwd(), "./logs");
  // if (!fs.existsSync(logsPath)) {
  //   fs.mkdirSync(logsPath);
  //   status = false;
  // }

  const historyPath = path.join(process.cwd(), "./history");
  if (!fs.existsSync(historyPath)) {
    fs.mkdirSync(historyPath);
    status = false;
  }

  const configPath = path.join(process.cwd(), "./config.json");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "{}", "utf8");
    status = false;
  }

  return status;
};

module.exports = { welcomeMessage, settingCheck };
