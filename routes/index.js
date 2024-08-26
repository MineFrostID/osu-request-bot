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
  const beatmapId = req;
  const username = req2;

  // Get beatmap details
  const data = await v2.beatmap.id.details(beatmapId);

  // Check if beatmap not found
  if (data.error) {
    console.log();
    console.log("=====================================");
    console.log("REQUEST BY USER: " + username);
    console.log("ERROR: " + data.error);
    console.log("=====================================");
    return false;
  }

  // Get beatmap details into variables
  const mapUrl = `https://osu.ppy.sh/b/${data.id}`;
  const artist = data.beatmapset.artist;
  const title = data.beatmapset.title;
  const respond = `${mapUrl} ${artist} - ${title}`;
  const message = `[${respond}]`;

  // Send message to osu!
  try {
    let banchoMessage = new banchojs.OutgoingBanchoMessage(
      client,
      users,
      `${username} => ${message}`
    );
    banchoMessage.send();
    console.log();
    console.log("=====================================");
    console.log("REQUEST BY USER: " + username);
    console.log("Chat Sent to osu!: ");
    console.log(respond);
    console.log("=====================================");
    return true;
  } catch (e) {
    console.log("=====================================");
    console.log("Failed to send message");
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
router.get("/request/:id", (req, res) => {
  if (!loginStatus) {
    res.send("Please login first!");
    return;
  }
  main(req.params.id, "Anonymous");
  res.send("Request Sent!");
});

// Get request with username
router.get("/request/:id/:name", async (req, res) => {
  if (!loginStatus) {
    res.send("Please login first!");
    return;
  }
  const status = await main(req.params.id, req.params.name);

  if (status) {
    res.send("Request Sent!");
  } else {
    res.send("Beatmap not found, try another one!");
  }
});

module.exports = router;
