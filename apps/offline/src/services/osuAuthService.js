const { auth } = require("osu-api-extended");
const { loadSettings, saveSettings } = require("../controllers/settings");
const config = require("../../config.json");

const client_id = config.clientId;
const client_secret = config.clientSecret;
const redirect_uri = config.redirectUri;
const scope_list = config.scopeList;

let userInfo = null;

const buildLoginUrl = () => {
  return auth.build_url(client_id, redirect_uri, scope_list);
};

const redirectUser = async (code) => {
  if (!code) {
    // Non-fatal: user belum memberikan code
    console.log("Authorization code is missing. Please login first.");
    return null;
  }

  try {
    userInfo = await auth.authorize(
      code,
      "osu",
      client_id,
      client_secret,
      redirect_uri,
    );

    if (userInfo?.authentication === "basic") {
      console.log(
        "Failed to authorize. Please check your CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI.",
      );
      return null;
    }

    await authorizeUser(userInfo.username);
    return userInfo;
  } catch (error) {
    handleError(error, "redirectUser");
    return null;
  }
};

const authorizeUser = async (username) => {
  try {
    const setting = loadSettings();

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
      saveSettings(setting);
    }

    console.log("osu-api-extended connected successfully!");
  } catch (error) {
    handleError(error, "authorizeUser");
  }
};

const getUserInfo = () => userInfo;

/**
 * Handle error secara ramah
 * @param {Error} error
 * @param {string} context
 */
const handleError = (error, context = "") => {
  const fatalErrors = [
    "ENOTFOUND",
    "ECONNREFUSED",
    "TypeError",
    "ReferenceError",
  ];

  // Jika error termasuk fatal, tampilkan stack lengkap
  if (
    fatalErrors.some((f) => error.message.includes(f) || error.name.includes(f))
  ) {
    console.error(`Fatal error in ${context}:`, error);
  } else {
    // Non-fatal, tampilkan pesan sederhana
    console.log(`Oops, something went wrong in ${context}. Please try again.`);
  }
};

module.exports = { buildLoginUrl, redirectUser, authorizeUser, getUserInfo };
