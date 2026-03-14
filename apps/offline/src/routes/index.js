const express = require("express");
const open = require("open").default;
const port = process.env.PORT || 3000;
const router = express.Router();
const osuAuthService = require("../services/osuAuthService");
const banchoService = require("../services/banchoService");
const request = require("../controllers/request");
const settings = require("../controllers/settings");
const welcome = require("../controllers/welcome");
const path = require("path");

router.get("/", (req, res) => {
  if (settings.webCheck() === 0) {
    res.sendFile(path.join(process.cwd(), "src", "views", "index.html"));
  } else if (settings.webCheck() === 1) {
    res.sendFile(path.join(process.cwd(), "src", "views", "api.html"));
  } else {
    res.sendFile(path.join(process.cwd(), "src", "views", "oauth.html"));
  }
  // if (banchoService.isLoggedIn()) {
  //   res.send("Welcome to osu! Request Youtube Bot!");
  // } else {
  //   res.send("Welcome! Please login at /login");
  // }
});

router.get("/login", async (req, res) => {
  if (banchoService.isLoggedIn()) {
    res.send("Already logged in!");
    return;
  }
  res.redirect(osuAuthService.buildLoginUrl());
});

router.get("/callback", async (req, res) => {
  if (banchoService.isLoggedIn()) {
    res.send("Already logged in!");
    return;
  }
  const userInfo = await osuAuthService.redirectUser(req.query.code);
  // res.send(
  //   `Logged in as ${userInfo.username}. Get your token at https://osu.ppy.sh/home/account/edit#legacy-api and continue to input your API V1 Token!`,
  // );
  res.redirect("/");
});

router.post("/banchoJS", async (req, res) => {
  const api = req.body.api;
  const username = settings.loadSettings().oauth_code?.username || "";
  await banchoService.loginBanchoJs(username, api);
  res.redirect("/");
});

router.get("/loginInfo", (req, res) => {
  const setting = settings.loadSettings();
  res.json({
    username: setting.oauth_code?.username || null,
    hasLegacy: !!setting.legacy_api_key,
    loggedIn: true,
  });
});

router.get("/request/:id", async (req, res) => {
  if (!banchoService.isLoggedIn()) {
    res.send("Please login first!");
    return;
  }
  const data = await request.sendRequest(req.params.id, "Anonymous");
  if (!data) res.send("Beatmap not found, try another one!");
  else res.send(data);
});

router.get("/request/:id/:name", async (req, res) => {
  if (!banchoService.isLoggedIn()) {
    res.send("Please login first!");
    return;
  }
  const data = await request.sendRequest(req.params.id, req.params.name);
  if (!data) res.send("Beatmap not found, try another one!");
  else res.send(data);
});

module.exports = router;
