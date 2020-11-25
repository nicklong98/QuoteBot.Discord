const help = (msg) => {
  const commandText = commands
    .map(
      ({ name, command, description }) => `
\`\`\`
Name: ${name}
Command: ${command}
Description: ${description || "N/A"}
\`\`\`
    `
    )
    .join("\n");
  msg.reply(commandText);
};
const getQuote = require("./getQuote");
const getStats = require("./stats");
const commands = [
  {
    name: "help",
    command: "!help",
    description: "prints out all the commands",
    exec: help,
  },
  getQuote,
  getStats,
];

module.exports = commands;
