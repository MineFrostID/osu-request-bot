var express = require("express");
var router = express.Router();
const { v2, auth } = require("osu-api-extended");
const banchojs = require("bancho.js");
const account = require("../users/account.json");
const config = require("../config/config.json");

const CODE = account.token;
const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_PASSWORD;
const REDIRECT_URI = config.REDIRECT_URL;
const SCOPE_LIST = config.SCOPE_LIST;

let client, users, userInfo;

let loginStatus = false;

// Welcome Message
const welcomeMessage = () => {
  console.log("=====================================");
  console.log("WELCOME TO OSU! REQUEST YOUTUBE BOT!");
  console.log("=====================================");
  console.log("Please login to your osu! account");
  console.log("=====================================");
  console.log("Open this link to login:");
  console.log("http://localhost:3000/login");
  console.log("=====================================");
};
welcomeMessage();

// Banchojs Login
const loginBanchoJs = async (username) => {
  if (loginStatus) return;
  try {
    client = new banchojs.BanchoClient({
      username: username,
      password: CODE,
    });

    users = client.getSelf();
    await client.connect();

    console.log("=====================================");
    console.log("BANCHOJS CONNECTED!");
    console.log("=====================================");
  } catch (e) {
    console.log("=====================================");
    console.log("Failed to connect BanchoJS");
    console.log("Please check your credential in users/account.json");
    console.log(
      "Get your token at https://osu.ppy.sh/home/account/edit#legacy-api"
    );
    console.log("=====================================");
    console.log("Stopping the server...");

    setTimeout(() => {
      process.exit();
    }, 5000);
  }
};

const url = async () => {
  const url = auth.build_url(CLIENT_ID, REDIRECT_URI, SCOPE_LIST);
  return url;
};

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

  await auth.login(CLIENT_ID, CLIENT_SECRET, SCOPE_LIST);

  loginBanchoJs(userInfo.username);

  console.log("=====================================");
  console.log("Logged in as " + userInfo.username);
  console.log("SUCCESS!");
  console.log("=====================================");
  console.log();

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
    console.log();
    console.log("=====================================");
    console.log("REQUEST BY USER: " + username);
    console.log("ERROR: " + e);
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
    console.log();
    console.log("=====================================");
    console.log("REQUEST BY USER: " + username);
    console.log("Chat Sent to osu!: ");
    console.log(respond);
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
      "Welcome to osu! Request Youtube Bot! Please open this link to login: http://localhost:3000/login"
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
  await login(req);
  res.send("Logged in! You can close this tab now!");
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
