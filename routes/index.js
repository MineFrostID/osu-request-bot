var express = require("express");
var readline = require("readline");
var router = express.Router();
const { v2, auth } = require("osu-api-extended");
const banchojs = require("bancho.js");
const config = require("../config/config.json");

const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_PASSWORD;
const REDIRECT_URI = config.REDIRECT_URL;
const SCOPE_LIST = config.SCOPE_LIST;

let client, users, userInfo;
let loginStatus = false;
let TOKEN_V1 = null;

// Welcome Message
const welcomeMessage = () => {
  console.log("=====================================");
  console.log("WELCOME TO OSU! REQUEST YOUTUBE BOT!");
  console.log("=====================================");
  console.log("=====================================");
  console.log("Please login to your osu! account");
  console.log("Open this link to login:");
  console.log("http://localhost:1054/login");
  console.log("=====================================");
};
welcomeMessage();
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Get API V1 Token with keyboard input
function getAPICode() {
  console.log("=====================================");
  console.log(
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

  for (let i = 0; i < 3 && !loginSuccess; i++) {
    TOKEN_V1 = await getAPICode();
    console.log("=====================================");
    try {
      client = new banchojs.BanchoClient({
        username: username,
        password: TOKEN_V1,
      });

      users = client.getSelf();
      await client.connect();

      console.log("=====================================");
      console.log("BANCHOJS CONNECTED!");
      console.log("=====================================");
      rl.close();
      loginSuccess = true;
    } catch (e) {
      console.log("=====================================");
      console.log("Failed to connect BanchoJS");
      console.log("Please check your credential in users/account.json");
      console.log("=====================================");
    }
  }

  if (!loginSuccess) {
    console.log("=====================================");
    console.log("Failed to connect BanchoJS");
    console.log("Please check your credential in users/account.json");
    console.log("=====================================");
    console.log("You have reached maximum login attempt");
    console.log("Stopping the server...");
    setTimeout(() => {
      process.exit();
    }, 5000);
  }
};

// Get URL for login
const url = async () => {
  const url = auth.build_url(CLIENT_ID, REDIRECT_URI, SCOPE_LIST);
  return url;
};

// Login to osu-api-extended and BanchoJS
const login = async (data) => {
  if (loginStatus) return;
  const token = data.query.code;

  userInfo = await auth.authorize(
    token,
    "osu",
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  // Login to osu-api-extended
  await auth.login(CLIENT_ID, CLIENT_SECRET, SCOPE_LIST);

  // Login to BanchoJS
  await loginBanchoJs(userInfo.username);

  console.log("=====================================");
  console.log("Logged in as " + userInfo.username);
  console.log("SUCCESS!");
  console.log("=====================================");

  loginStatus = true;
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
    console.log("=====================================");
    console.log("ERROR: " + e);
    console.log("=====================================");
    return false;
  }

  if (data.error) {
    console.log("=====================================");
    console.log("REQUEST BY USER: " + username);
    console.log("ERROR: " + data.error);
    console.log("=====================================");
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

  // Get beatmap details into variables
  const mapUrl = `https://osu.ppy.sh/b/${data.id}`;
  const artist = data.beatmapset.artist;
  const title = data.beatmapset.title;
  const respond = `${mapUrl} ${artist} - ${title}`;
  const message = `[${respond}]`;
  const respondMessage = `Request send: [${reqMods}] ${artist} - ${title} (${mapUrl})`;

  // Send message to osu!
  try {
    let banchoMessage = new banchojs.OutgoingBanchoMessage(
      client,
      users,
      `${username} => [${reqMods}] ${message}`
    );
    banchoMessage.send();
    console.log("=====================================");
    console.log("REQUEST BY USER: " + username);
    console.log("Chat Sent to osu!: ");
    console.log(`[${reqMods}] ${respond}`);
    console.log("=====================================");
    return respondMessage;
  } catch (e) {
    console.log("=====================================");
    console.log("Failed to send message");
    console.log("ERROR: " + e);
    console.log("=====================================");
    return false;
  }
};

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

router.get("/login", async (req, res) => {
  if (loginStatus) {
    res.send("You are already logged in!");
    return;
  }
  res.redirect(await url());
});

router.get("/callback", async (req, res) => {
  if (loginStatus) {
    res.send("You are already logged in!");
    return;
  }
  res.send(
    "Logged in! You can close this tab now, continue to input your API V1 Token!"
  );
  await login(req);
});

// Get request anonymously
router.get("/request/:id", async (req, res) => {
  if (!loginStatus) {
    res.send("Please login first!");
    return;
  }
  const messageSend = await main(req.params.id, "Anonymous");
  if (!messageSend) res.send("Beatmap not found, try another one!");
  else res.send(messageSend);
});

// Get request with username
router.get("/request/:id/:name", async (req, res) => {
  if (!loginStatus) {
    res.send("Please login first!");
    return;
  }
  const messageSend = await main(req.params.id, req.params.name);
  if (!messageSend) res.send("Beatmap not found, try another one!");
  else res.send(messageSend);
});

module.exports = router;
