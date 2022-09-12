const axios = require('axios');
const github = require('@actions/github');
const core = require('@actions/core');

async function send_message(token, chatId, text) {
    return axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'MarkdownV2',
    })
}

(async function run() {
    try {
        core.info(JSON.stringify(github.context.eventName));
        core.info(JSON.stringify(github.context.payload));
        await send_message(core.getInput('token'), core.getInput('chat'), github.context.eventName);
    } catch (error) {
      core.setFailed(error.message);
    }
  })()
