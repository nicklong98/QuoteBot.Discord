const fetch = require("node-fetch");
const { BASE_URL } = require("../config.json");
const { getUserById } = require("../utils");

module.exports = {
  name: "get quote",
  command: "!q",
  exec: async (msg, args) => {
    if (args && args.length) {
      storeQuote(msg, args.join(" "));
      return;
    }
    await getRandomQuote(msg);
  },
};

const getRandomQuote = async (msg) => {
  const {
    guild: { id: serverId },
  } = msg;
  const response = await fetch(`${BASE_URL}/quotes/${serverId}/random`);
  if (!response.ok) {
    msg.reply(
      "hmmmm, some bad shit happened and the quotebot server is borked. Bug nick about it"
    );
    console.error(response);
    return;
  }
  const { body } = await response.json();
  const quote = await replaceText(body, msg.guild);
  await msg.channel.send(`
\`\`\`
${quote}
\`\`\`
  `);
};

const userRegex = /<@!([0-9]*)>/g;

const storeQuote = async (msg, quoteBody) => {
  const {
    author: { id: reporterId },
    guild: { id: serverId },
  } = msg;
  const userIds = [...quoteBody.matchAll(userRegex)]
    .map((match) => match[1])
    .filter((value, index, self) => self.indexOf(value) === index);
  const promises = userIds.map((userId) => {
    const request = { serverId, userId, reporterId, body: quoteBody };
    return fetch(`${BASE_URL}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  });
  await Promise.all(promises);
  console.log("stored quote");
};

const replaceText = async (text, server) => {
  return await replaceAsync(text, userRegex, async (__, p1) => {
    const user = await getUserById(server, p1);
    if (!user) {
      console.warn("can't find user with id " + id);
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
