const fetch = require("node-fetch");
const { BASE_URL } = require("../config.json");
const { getDisplayNameById } = require("../utils");

module.exports = {
  name: "egg",
  command: "!egg",
  description: "an egg",
  exec: async (msg) => {
    const {
      guild: { id: serverId },
    } = msg;
    await msg.channel.send("POOF you're an egg");
  },
};
