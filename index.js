const Discord = require("discord.js");
const commands = require("./commands");

const main = async () => {
  const { BOT_TOKEN } = require("./config.json");
  const client = new Discord.Client();

  client.on("ready", () => {
    console.info(`logged in as ${client.user.tag}`);
  });

  client.on("message", async (msg) => {
    const {
      author: { bot: isBot },
      content,
      attachments,
    } = msg;
    if (isBot) {
      return;
    }
    const args = content.split(/ +/);
    const command = args.shift().toLowerCase();
    const targetCommand = commands.find((x) => x.command === command);
    if (targetCommand) {
      if (attachments.length) {
        console.log("there are attachments");
        console.log(attachments);
      } else {
        console.log("no attachments");
        console.log(attachments);
      }
      console.info(`called command ${command}`);
      if (targetCommand.exec) {
        targetCommand.exec(msg, args);
      } else {
        console.warn(
          `command ${command} is registered but there is no executor!`
        );
      }
    }
  });

  await client.login(BOT_TOKEN);
};

main();
