// INITIALIZATION
// Require modules
var express = require("express");
var readline = require("readline");
var router = express.Router();
require("console-stamp")(console, { pattern: "dd/mm/yyyy HH:MM:ss" });
const { v2, auth } = require("osu-api-extended");
const banchojs = require("bancho.js");
const dotenv = require("dotenv");
dotenv.config();

// Variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPE_LIST = ["public"];
let client, users, userInfo;
let loginStatus = false;
let TOKEN_V1 = null;

// CONFIGURATION
// Keyboard input
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Welcome Message
const welcomeMessage = () => {
  console.info("WELCOME TO OSU! REQUEST YOUTUBE BOT!");
  console.info("Please login to your osu! account");
  console.info("Open this link to login:");
  console.info("http://localhost:" + process.env.PORT + "/login");
};
welcomeMessage();

// Get API V1 Token with keyboard input
function getAPICode() {
  console.info("=====================================");
  console.info(
    "Get your token at https://osu.ppy.sh/home/account/edit#legacy-api"
  );
  return new Promise((resolve) =>
    rl.question("Enter your osu! API V1 token: ", (answer) => resolve(answer))
  );
}

// Banchojs Login
const loginBanchoJs = async (username) => {
  if (loginStatus) return;
  var loginSuccess = false;

  // Try to login 3 times
  for (let i = 0; i < 3 && !loginSuccess; i++) {
    // Input API V1 Token
    TOKEN_V1 = await getAPICode();
    // Try to login to BanchoJS
    try {
      client = new banchojs.BanchoClient({
        username: username,
        password: TOKEN_V1,
      });

      users = client.getSelf();
      await client.connect();

      console.info("=====================================");
      console.info("BANCHOJS CONNECTED!");

      // Close readline and set loginSuccess to true
      rl.close();
      loginSuccess = true;
    } catch (e) {
      console.warn("Failed to connect BanchoJS");
      console.warn("Please check your credential in users/account.json");
    }
  }
  return loginSuccess;
};

// Get URL for login
const url = async () => {
  const url = auth.build_url(CLIENT_ID, REDIRECT_URI, SCOPE_LIST);
  return url;
};

// Login to osu-api-extended and BanchoJS
const login = async (data) => {
  if (loginStatus) return;
  const token = data;

  // Authorize token
  userInfo = await auth.authorize(
    token,
    "osu",
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  // Check if login failed
  if (userInfo.authentication === "basic") {
    console.error("Failed to login to osu-api-extended");
    console.error("Please check your environment variables");
    console.error("Stopping the server...");
    process.exit();
  }

  // Login to osu-api-extended
  await auth.login(CLIENT_ID, CLIENT_SECRET, SCOPE_LIST);

  // Login BanchoJS
  if (await loginBanchoJs(userInfo.username)) {
    console.info("Logged in as " + userInfo.username);
    console.info("SUCCESS!");

    loginStatus = true;
  } else {
    console.error("Failed to connect BanchoJS");
    console.error("Please check your credential in users/account.json");
    console.error("You have reached maximum login attempt");
    console.error("Stopping the server...");
    setTimeout(() => {
      process.exit();
    }, 5000);
  }
};

// Main function
const main = async (req, req2) => {
  if (!loginStatus) return false;
  // Get id and username from request

  // Variable for mods
  const mods = [
    "EZ",
    "HD",
    "HR",
    "DT",
    "NC",
    "FL",
    "EZDT",
    "DTEZ",
    "EZHD",
    "HDEZ",
    "EZNC",
    "NCEZ",
    "EZFL",
    "FLEZ",
    "HDHR",
    "HRHD",
    "HDDT",
    "DTHD",
    "HDNC",
    "NCHD",
    "HDFL",
    "FLHD",
    "HRDT",
    "DTHR",
    "HRNC",
    "NCHR",
    "HRFL",
    "FLHR",
    "DTFL",
    "FLDT",
    "NCFL",
    "FLNC",
  ];

  // Get id and username from request
  const reqArr = req.split(" ");
  const username = req2;
  let reqMods = null;
  let useMods = false;
  let data;
  const beatmapId = reqArr[0];

  // Get beatmap details
  try {
    data = await v2.beatmap.id.details(beatmapId);
  } catch (e) {
    console.error("=====================================");
    console.error("ERROR: " + e);
    console.error("=====================================");
    return false;
  }

  if (data.error) {
    console.info("=====================================");
    console.info("REQUEST BY USER: " + username);
    console.info("ERROR: " + data.error);
    console.info("=====================================");
    return false;
  }

  if (reqArr.length > 1) {
    for (let i = 1; i < reqArr.length && !useMods; i++) {
      if (reqArr !== undefined) {
        reqArr[i] = reqArr[i].toUpperCase();
        if (mods.includes(reqArr[i])) {
          reqMods = reqArr[i];
          useMods = true;
        }
      }
    }
  }

  if (!useMods) {
    reqMods = "NM";
  }

  // Send message to osu!
  try {
    // Get beatmap details into variables
    const mapUrl = `https://osu.ppy.sh/b/${data.id}`;
    const artist = data.beatmapset.artist;
    const title = data.beatmapset.title;
    const detail = `${artist} - ${title}`;
    const respond = `${mapUrl} ${detail}`;
    const message = `[${respond}]`;
    const respondMessage = `Request send: [${reqMods}] ${detail} (${mapUrl})`;

    let banchoMessage = new banchojs.OutgoingBanchoMessage(
      client,
      users,
      `${username} => [${reqMods}] ${message}`
    );
    banchoMessage.send();
    console.info("=====================================");
    console.info("REQUEST BY : " + username);
    console.info("MODS       : " + reqMods);
    console.info("DETAIL     : " + detail);
    console.info("LINK       : " + mapUrl);
    console.info("=====================================");
    return respondMessage;
  } catch (e) {
    console.info("=====================================");
    console.info("Failed to send message");
    console.info("ERROR: " + e);
    console.info("=====================================");
    return false;
  }
};

// ROUTES
// GET home page
router.get("/", function (req, res) {
  if (loginStatus) {
    res.send("Welcome to osu! Request Youtube Bot!");
  } else if (!loginStatus) {
    res.send(
      "Welcome to osu! Request Youtube Bot! Please open this link to login: http://localhost:1054/login"
    );
  }
});

// Login
router.get("/login", async (req, res) => {
  if (loginStatus) {
    console.info("=====================================");
    console.info("You are already logged in!");
    console.info("=====================================");
    res.send("You are already logged in!");
    return;
  }
  res.redirect(await url());
});

// Callback
router.get("/callback", async (req, res) => {
  if (loginStatus) {
    console.info("=====================================");
    console.info("You are already login!");
    console.info("=====================================");
    res.send("You are already logged in!");
    return;
  }
  res.send(
    "Logged in! You can close this tab now, continue to input your API V1 Token!"
  );
  await login(req.query.code);
});

// Get request anonymously
router.get("/request/:id", async (req, res) => {
  if (!loginStatus) {
    console.warn("=====================================");
    console.warn("Please login first!");
    console.warn("=====================================");
    res.send("Bot is not active");
    return;
  }
  const messageSend = await main(req.params.id, "Anonymous");
  if (!messageSend) res.send("Beatmap not found, try another one!");
  else res.send(messageSend);
});

// Get request with username
router.get("/request/:id/:name", async (req, res) => {
  if (!loginStatus) {
    console.warn("=====================================");
    console.warn("Please login first!");
    console.warn("=====================================");
    res.send("Bot is not active");
    return;
  }
  const messageSend = await main(req.params.id, req.params.name);
  if (!messageSend) res.send("Beatmap not found, try another one!");
  else res.send(messageSend);
});

module.exports = router;
