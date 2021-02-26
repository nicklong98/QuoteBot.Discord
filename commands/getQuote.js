const fetch = require("node-fetch");
const { MessageAttachment, MessageEmbed } = require("discord.js");
const { BASE_URL } = require("../config.json");
const { getUserById } = require("../utils");

module.exports = [
  {
    name: "get quote",
    command: "!q",
    exec: async (msg, args) => {
      if (args && args.length) {
        storeQuote(msg, args.join(" "));
        return;
      }
      await getRandomQuote(msg);
    },
  },
  {
    name: "target quote",
    command: "!quote",
    description:
      "You ever just need a David quote? Just use !quote @DavidsUsername",
    exec: async (msg) => {
      console.log("hi there");
      if (msg.mentions) {
        await Promise.all(
          msg.mentions.users.map(async ({ id: targetUserId }) => {
            await getRandomQuote(msg, targetUserId);
          })
        );
      }
    },
  },
];

const getRandomQuote = async (msg, userId) => {
  const {
    guild: { id: serverId },
  } = msg;
  const url = `${BASE_URL}/quotes/${serverId}/random${
    (userId && `/${userId}`) || ""
  }`;
  console.log(`the url is ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    msg.reply(
      "hmmmm, some bad shit happened and the quotebot server is borked. Bug nick about it"
    );
    console.error(response);
    return;
  }
  const { body, attachmentUrls, authorId } = await response.json();
  await msg.channel.send(
    await formatMessage(msg, authorId, body, attachmentUrls)
  );
};

const formatMessage = async (msg, authorId, body, attachmentUrls) => {
  const { user, displayName } = await msg.guild.members.fetch(authorId);
  const quote = await replaceText(body, msg.guild);
  const targetAttachmentUrl =
    attachmentUrls &&
    attachmentUrls.length &&
    attachmentUrls[Math.floor(Math.random() * attachmentUrls.length)];
  const embed = new MessageEmbed()
    .setAuthor(displayName, user.displayAvatarURL())
    .setDescription(quote);
  targetAttachmentUrl && embed.setImage(targetAttachmentUrl);
  return embed;
};

const userRegex = /<@!([0-9]*)>/g;

const storeQuote = async (msg, quoteBody) => {
  const {
    author: { id: reporterId },
    guild: { id: serverId },
    attachments,
  } = msg;
  const attachmentUrls = attachments.map(({ url }) => url);
  const userIds = [...quoteBody.matchAll(userRegex)]
    .map((match) => match[1])
    .filter((value, index, self) => self.indexOf(value) === index);
  const promises = userIds.map((userId) => {
    const request = {
      serverId,
      userId,
      reporterId,
      body: quoteBody,
      attachments: attachmentUrls,
    };
    return fetch(`${BASE_URL}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  });
  if (promises && promises.length) {
    await Promise.all(promises);
    console.log("stored quote");
    await msg.react("✅");
  } else {
    console.log("no users found");
    await msg.react("❓");
  }
};

const replaceText = async (text, server) => {
  const userMatches = text.match(userRegex);
  const numUsers = userMatches.filter((x, i, ar) => ar.indexOf(x) === i).length;
  if (numUsers === 1) {
    const removeLastUserRegex = /-? *<@![0-9]*> *$/;
    text = text.replace(removeLastUserRegex, "");
  }
  return await replaceAsync(text, userRegex, async (__, p1) => {
    const user = await getUserById(server, p1);
    if (!user) {
      console.warn("can't find user with id " + p1);
      return "Someone who isn't on this server";
    }
    return user.displayName;
  });
};

const replaceAsync = async (str, regex, asyncFn) => {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
};
