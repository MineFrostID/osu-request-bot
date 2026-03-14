const fs = require("fs");
const path = require("path");

const loadTemplate = (fileName) => {
  let templatePath;
  if (process.pkg) {
    templatePath = path.join(__dirname, "..", "views", fileName);
  } else {
    templatePath = path.join(process.cwd(), "src", "views", fileName);
  }
  return fs.readFileSync(templatePath, "utf8");
};

module.exports = { loadTemplate };
