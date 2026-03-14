const fs = require("fs");
const path = require("path");

const settingsPath = path.resolve(process.cwd(), "setting.json");

function ensureSettingsFile() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, "{}", "utf8");
  }
}

function loadSettings() {
  ensureSettingsFile();

  try {
    const raw = fs.readFileSync(settingsPath, "utf8");
    return JSON.parse(raw || "{}");
  } catch (error) {
    console.warn("Setting file corrupted. Resetting...");
    resetSettings();
    return {};
  }
}

function saveSettings(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf8");
}

function resetSettings() {
  saveSettings({});
}

function isLogin() {
  const setting = loadSettings();

  const hasOauth = !!setting.oauth_code;
  const hasLegacy = !!setting.legacy_api_key;

  if (hasOauth && hasLegacy) {
    return true;
  }

  if (hasOauth || hasLegacy) {
    console.warn("Partial login detected. Resetting settings...");
    resetSettings();
  }

  return false;
}

function webCheck() {
  const setting = loadSettings();

  if (setting.oauth_code && setting.legacy_api_key) return 0;
  if (setting.oauth_code) return 1;
  return 2;
}

module.exports = {
  loadSettings,
  saveSettings,
  resetSettings,
  isLogin,
  webCheck,
};
