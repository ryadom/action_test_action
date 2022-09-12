const axios = require('axios');
const github = require('@actions/github');
const core = require('@actions/core');

async function send_message(token, chatId, text) {
    return axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: 'True',
    })
}

function escape(text) {
    if (!text) {
        return ''
    }
    for (let c of '.-{}=()_*[]~`>#+|!') {
        text = text.replaceAll(c, '\\' + c);
    }
    return text;
}

(async function run() {
    try {
        const telegramToken = core.getInput('token');
        const chatId = core.getInput('chat');
        const status = core.getInput('status');
        const payload = github.context.payload;
        const repoName = payload.repository.name;
        const repoUrl = payload.repository.url;
        const workflow = github.context.workflow;
        let statusIcon;
        switch (status) {
            case 'success': statusIcon = '✅'; break;
            case 'failure': statusIcon = '🔴'; break;
            default: statusIcon = '⚠️'; break;
        }
        core.debug(JSON.stringify(payload));
        if (github.context.eventName == 'push') {
            const ref = github.context.ref;
            if (!ref.startsWith('refs/heads/')) {
                core.setFailed(`can't parse ref ${ref}`);
                return;
            }
            const branchName = ref.substring(11);
            const branchUrl = `${repoUrl}/tree/${branchName}`;
            const commitMessage = payload.head_commit.message;
            const commitAuthor = payload.head_commit.author.username;
            let message = `${statusIcon} [${escape(repoName)}/${escape(branchName)}](${escape(branchUrl)}) ${escape(workflow)} *${escape(status)}*
\`\`\`${escape(commitMessage)}\`\`\` by [${escape(commitAuthor)}](http://github.com/${escape(commitAuthor)})`;
            await send_message(telegramToken, chatId, message);    
        } else {
            core.setFailed(`unsupported eventName ${github.context.eventName}`);
        }
    } catch (error) {
      core.setFailed(error.message);
    }
  })();
