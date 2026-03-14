// const { v2 } = require("osu-api-extended");
// const banchojs = require("bancho.js");
// const {
//   getClient,
//   getUsers,
//   isLoggedIn,
// } = require("../services/banchoService");
// const path = require("path");
// const fs = require("fs");
import { v2 } from "osu-api-extended";
import banchojs from "bancho.js";
import { getClient, getUsers, isLoggedIn } from "../services/banchoService.js";
import path from "path";
import fs from "fs";

const MODS = new Set([
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
]);

const sendRequest = async (input, username) => {
  try {
    if (!isLoggedIn()) {
      console.log("BanchoJS not connected. Please login first.");
      return false;
    }

    const reqArr = input.split(" ");
    const beatmapId = parseInt(reqArr[0]);
    let reqMods = "NM";

    if (!Number.isInteger(beatmapId) || beatmapId <= 0) {
      console.log("Invalid beatmap id:", beatmapIdRaw);
      return false;
    }

    if (reqArr.length > 1) {
      for (let i = 1; i < reqArr.length; i++) {
        const mod = reqArr[i].toUpperCase();
        if (MODS.has(mod)) {
          reqMods = mod;
          break;
        }
      }
    }

    let data;
    try {
      data = await v2.beatmap.id.details(beatmapId);
    } catch (e) {
      console.log("Error fetching beatmap:", e);
      return false;
    }

    if (!data || data.error) {
      console.log("Beatmap not found or API returned error.");
      return false;
    }

    try {
      const mapUrl = `https://osu.ppy.sh/b/${data.id}`;
      const artist = data.beatmapset.artist || "Unknown Artist";
      const title = data.beatmapset.title || "Unknown Title";
      const mapper = data.beatmapset.creator || "Unknown Mapper";
      const detail = `${artist} - ${title}`;
      const respond = `${mapUrl} ${detail}`;
      const message = `[${respond}]`;
      const respondMessage = `Request send: [${reqMods}] ${artist} - ${title} (${mapUrl})`;

      const client = getClient();
      const users = getUsers();
      if (!client || !users) {
        console.log("BanchoJS client not ready.");
        return false;
      }

      const banchoMessage = new banchojs.OutgoingBanchoMessage(
        client,
        users,
        `${username} => [${reqMods}] ${message}`,
      );
      banchoMessage.send();

      console.log("=====================================");
      console.log("REQUEST BY :", username);
      console.log("DETAIL     :", detail);
      console.log("MAPPER     :", mapper);
      console.log("MODS       :", reqMods);
      console.log("LINK       :", mapUrl);
      console.log("=====================================");

      historyRequest(username, detail, mapper, reqMods, mapUrl);

      const response = {
        status: "success",
        message: respondMessage,
        data: data,
      };

      return response;
    } catch (e) {
      console.log("Failed to send message:", e?.message || e);
      return false;
    }
  } catch (error) {
    console.log("Failed to send request:", error?.message || error);
  }
};

const historyRequest = (username, detail, mapper, reqMods, mapUrl) => {
  const now = new Date();

  const date = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const time = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  const logsPath = path.join(process.cwd(), "./history");
  const filename = `${date}.txt`;
  const filePath = path.join(logsPath, filename);

  const logContent = `=====================================\n[${date} ${time}]\nREQUEST BY: ${username}\nDETAIL: ${detail}\nMAPPER: ${mapper}\nMODS: ${reqMods}\nLINK: ${mapUrl}\n=====================================\n\n`;

  fs.appendFileSync(filePath, logContent, "utf8");
};

export { sendRequest };
