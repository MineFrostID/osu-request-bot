const banchojs = require("bancho.js");
const readline = require("readline");
const { saveSettings, loadSettings } = require("../controllers/settings");

let client = null;
let users = null;
let loginStatus = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleError = (error, context = "") => {
  const fatalErrors = [
    "ENOTFOUND",
    "ECONNREFUSED",
    "TypeError",
    "ReferenceError",
  ];
  if (
    fatalErrors.some((f) => error.message.includes(f) || error.name.includes(f))
  ) {
    console.error(`Fatal error in ${context}:`, error);
  } else {
    console.log(
      `Oops, something went wrong in ${context}. Please check your input and try again.`,
    );
  }
};

const connectBancho = async (username, token) => {
  try {
    client = new banchojs.BanchoClient({
      username: username,
      password: token,
    });

    client.on("disconnect", () => {
      console.log("BANCHOJS DISCONNECTED!");
      loginStatus = false;
    });

    await client.connect();
    users = client.getSelf();

    console.log("bancho.js Connected!");
    rl.close();
    loginStatus = true;

    const setting = loadSettings();
    setting.legacy_api_key = token;
    saveSettings(setting);

    return { client, users };
  } catch (error) {
    handleError(error, "connectBancho");
    return null;
  }
};

const loginBanchoJs = async (username, api) => {
  try {
    if (loginStatus && client) return { client, users };

    if (!api) {
      console.log("API V1 token cannot be empty. Please try again.");
      return null;
    }

    const connection = await connectBancho(username, api);
    if (!connection) {
      console.log(
        "Failed to connect BanchoJS. Please make sure your username and token are correct.",
      );
      return null;
    }

    return connection;
  } catch (error) {
    handleError(error, "loginBanchoJs");
    return null;
  }
};

const isLoggedIn = () => Boolean(loginStatus && client);
const getClient = () => client;
const getUsers = () => users;

module.exports = {
  connectBancho,
  loginBanchoJs,
  isLoggedIn,
  getClient,
  getUsers,
};
