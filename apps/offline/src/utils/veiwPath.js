const path = require("path");

const getViewsDir = () => {
  // Kalau dijalankan dari pkg/exe
  if (process.pkg) {
    return path.join(path.dirname(process.execPath), "views");
  }
  // Mode development
  return path.join(process.cwd(), "src", "views");
};

module.exports = { getViewsDir };
