const context = require("../context");
const { apiAddReaction } = require("../integration/slack-api");
const buildMessage = require("./build-reaction");

const jsonPretty = (data) => JSON.stringify(data, undefined, 2);

const addReaction = async () => {
  try {
    const token = context.getRequired("slack-bot-user-oauth-access-token");
    const channelId = context.getRequired("slack-channel");
    const emojiName = context.getRequired("slack-emoji-name");
    const messageTimestamp = context.getRequired("slack-message-timestamp");

    const payload = buildMessage(channelId, emojiName, messageTimestamp);
    const result = await apiAddReaction(token, payload);

    const resultAsJson = jsonPretty(result);
    context.setOutput("slack-result", resultAsJson);
  } catch (error) {
    context.setFailed(jsonPretty(error));
  }
};

module.exports = { addReaction };