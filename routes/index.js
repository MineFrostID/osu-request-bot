var express = require("express");
var router = express.Router();
const { v2, auth } = require("osu-api-extended");
const banchojs = require("bancho.js");
const account = require("../config/account.json");

const USERNAME = account.username;
const CODE = account.token;
const PASSWORD = account.password;

let client, users;

// Banchojs client
try {
  client = new banchojs.BanchoClient({
    username: USERNAME,
    password: CODE,
  });
} catch (e) {
  console.log("=====================================");
  console.log("Failed to login");
  console.log("Please check your credential in config/account.json");
  console.log("=====================================");
  return;
}

// Login to osu-api-extended and banchojs
const login = async () => {
  // // Auth via lazer
  const login_lazer = await auth.login_lazer(USERNAME, PASSWORD);
  if (login_lazer.access_token === undefined) {
    console.log("=====================================");
    console.log("Failed to login");
    console.log("Please check your credential in config/account.json");
    console.log("=====================================");
    return;
  }

  users = client.getSelf();
  await client.connect();

  console.log("=====================================");
  console.log("Bot connected!");
  console.log("=====================================");
};
login();

// Main function
const main = async (req, req2) => {
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
  res.send("Welcome to osu! Request Youtube Bot!");
});

// Get request anonymously
router.get("/request/:id", (req, res) => {
  main(req.params.id, "Anonymous");
  res.send("Request Sent!");
});

// Get request with username
router.get("/request/:id/:name", async (req, res) => {
  const status = await main(req.params.id, req.params.name);

  if (status) {
    res.send("Request Sent!");
  } else {
    res.send("Beatmap not found, try another one!");
  }
});

module.exports = router;
