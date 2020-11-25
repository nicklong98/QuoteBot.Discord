const getUserById = async (server, userId) =>
  server.members.cache.get(userId) || (await server.members.fetch(userId));
const getDisplayNameById = async (server, userId) =>
  (
    (await getUserById(server, userId)) || {
      displayName: "Someone who isn't here anymore",
    }
  ).displayName;

module.exports = {
  getUserById,
  getDisplayNameById,
};
