const { auth } = require("osu-api-extended");
const env = process.env;
const client_id = env.CLIENT_ID;
const client_secret = env.CLIENT_SECRET;
const redirect_uri = env.REDIRECT_URI;
const scope_list = JSON.parse(env.SCOPE_LIST);

const settings = require("../controllers/settings");

let userInfo = null;

const buildLoginUrl = () => {
  return auth.build_url(client_id, redirect_uri, scope_list);
};

const redirectUser = async (code) => {
  try {
    if (!code) throw new Error("Missing authorization code");

    userInfo = await auth.authorize(
      code,
      "osu",
      client_id,
      client_secret,
      redirect_uri,
    );

    if (userInfo?.authentication === "basic") {
      throw new Error(
        "Failed to authorize with osu! (check CLIENT_ID/SECRET/REDIRECT_URI)",
      );
    }

    await authorizeUser(userInfo.username);

    return userInfo;
  } catch (error) {
    console.error(
      "Error during user authorization with osu-api-extended:",
      error,
    );
    throw error;
  }
};

const authorizeUser = async (username) => {
  try {
    const setting = settings.loadSettings();

    if (setting.oauth_code) {
      await auth.login(
        client_id,
        client_secret,
        scope_list,
        setting.oauth_code.access_token,
      );
    } else {
      const data = await auth.login(client_id, client_secret, scope_list);

      data.username = username;
      setting.oauth_code = data;
      settings.saveSettings(setting);
    }

    console.log("osu-api-extended Connected!");
  } catch (error) {
    console.error("Error during authorization with osu-api-extended:", error);
    throw error;
  }
};

const getUserInfo = () => userInfo;

module.exports = {
  buildLoginUrl,
  redirectUser,
  authorizeUser,
  getUserInfo,
};
