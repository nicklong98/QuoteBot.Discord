const fetch = require("node-fetch");
const { BASE_URL } = require("../config.json");
const { getDisplayNameById } = require("../utils");

module.exports = {
  name: "Stats",
  command: "!stats",
  description: "who's the most quoted person?",
  exec: async (msg) => {
    const {
      guild: { id: serverId },
    } = msg;
    const response = await fetch(`${BASE_URL}/stats/${serverId}`);
    const serverStats = await response.json();
    const transformationPromises = serverStats.map(
      async ({ userId, numberOfQuotes }) => {
        const displayName = await getDisplayNameById(msg.guild, userId);
        return `${displayName}: ${numberOfQuotes}`;
      }
    );
    const message =
      "```\n" +
      (await Promise.all(transformationPromises)).join("\n") +
      "\n```";
    await msg.channel.send(message);
  },
};
