const express = require("express");
const { buildLoginUrl, redirectUser } = require("../services/osuAuthService");
const { isLoggedIn, loginBanchoJs } = require("../services/banchoService");
const { sendRequest } = require("../controllers/request");
const {
  webCheck,
  loadSettings,
  openBrowser,
} = require("../controllers/settings");
const port = require("../../config.json").port || 3000;
const { loadTemplate } = require("../utils/templateHelper");

const router = express.Router();

router.get("/", (req, res) => {
  let template;
  if (webCheck() === 0) template = loadTemplate("index.html");
  else if (webCheck() === 1) template = loadTemplate("api.html");
  else template = loadTemplate("oauth.html");

  res.send(template);
});

router.get("/login", async (req, res) => {
  if (isLoggedIn()) {
    openBrowser(port);
    return;
  }
  res.redirect(buildLoginUrl());
});

router.get("/callback", async (req, res) => {
  if (isLoggedIn()) {
    res.send("Already logged in!");
    return;
  }
  const code = req.query.code;
  await redirectUser(code);
  res.redirect("/");
});

router.post("/banchoJS", async (req, res) => {
  const api = req.body.api;
  const username = loadSettings().oauth_code?.username || "";
  await loginBanchoJs(username, api);
  res.redirect("/");
});

router.get("/loginInfo", (req, res) => {
  const setting = loadSettings();
  res.json({
    username: setting.oauth_code?.username || null,
    hasLegacy: !!setting.legacy_api_key,
    loggedIn: true,
  });
});

router.get("/request/:id", async (req, res) => {
  if (!isLoggedIn()) {
    res.send("Please login first!");
    return;
  }
  const data = await sendRequest(req.params.id, "Anonymous");
  if (!data) res.send("Beatmap not found, try another one!");
  else res.send(data);
});

router.get("/request/:id/:name", async (req, res) => {
  if (!isLoggedIn()) {
    res.send("Please login first!");
    return;
  }
  const data = await sendRequest(req.params.id, req.params.name);
  if (!data) res.send("Beatmap not found, try another one!");
  else res.send(data);
});

module.exports = router;
