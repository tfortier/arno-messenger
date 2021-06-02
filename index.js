const core = require('@actions/core');
const github = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const { buildAttachment } = require('./src/buildAttachment');
const { convertStatusToEmoji, buildTitleLine } = require('./src/buildTitleLine');
const { formatChannelName } = require('./src/formatChannelName');

(async () => {
  try {
    
    // Initial setup to validate we have everything we need
    const timestamp             = new Date();
    const slackBotToken         = process.env.SLACK_BOT_TOKEN;
    const slackClient           = new WebClient(slackBotToken);
    const actionChannelName     = core.getInput('channel');
    const actionChannelId       = core.getInput('channel_id');

    if (!actionChannelName && !actionChannelId) {
        core.setFailed("You need to set either a 'channel' or a 'channel_id'.")
        return;
    }

    const channelId = actionChannelId || (await findChannelIdFromName({ slackClient, actionChannelName }));

    if (!channelId) {
        core.setFailed(`Slack channel "${actionChannelName}" does not appear to exist.`);
        return;
    }

    // Gther information for the actual posting
    const actionData = {
        color:              core.getInput('color'),
        inputs:             JSON.parse(core.getInput('inputs', { required: false }) || '{}'),
        matrix:             JSON.parse(core.getInput('matrix', { required: false }) || '{}'),
        messageId:          core.getInput('message_id'),
        messageId:          core.getInput('message_id'),
        notes:              JSON.parse(core.getInput('notes', { required: false }) || '{}'),
        status:             core.getInput('status'),
        steps:              JSON.parse(core.getInput('steps', { required: false }) || '{}'),
        titlePrefix:        core.getInput('title_prefix'),
        titleSuffix:        core.getInput('title_suffix'),
        version:            core.getInput('version'),
    }
    const githubData = {
        actor:              github.context.actor,
        branch:             github.context.eventName === 'pull_request' ? github.context.payload.pull_request.head.ref : github.context.ref.replace('refs/heads/', ''),
        commitSha:          github.context.sha,
        compare:            github.context.payload.compare,
        eventName:          github.context.eventName,
        job:                github.context.job,
        payload:            github.context.payload,
        repositoryName:     github.context.payload.repository.full_name,
        repositoryUrl:      github.context.payload.repository.html_url,
        runId:              github.context.runId,
        workflowName:       github.context.workflow,
    }
    const apiMethodToUse        = Boolean(actionData.messageId) ? 'update' : 'postMessage';

    // Build & Post message

    const args = {
        link_names: 1,
        channel: channelId,
        text: buildTitleLine({actionData, githubData}),
        attachments: buildAttachment({actionData, githubData}),
    };
  
    if (actionData.messageId) {
        args.ts = actionData.messageId;
    }
  
    const response = await slackClient.chat[apiMethodToUse](args);
    const mainMessageId = response.ts;

    // Post additional messages in the thread

    let threadMessage = `${convertStatusToEmoji(actionData.status)}  \`${timestamp.toLocaleString('fr-CA', { timeZone: 'America/Montreal' })}\``

    if(actionData.version !== undefined && actionData.version !== null && actionData.version != ""){
        threadMessage += '\n\n' + `*Version* : ${actionData.version}`
    }

    if(actionData.inputs !== undefined && actionData.inputs !== null && Object.keys(actionData.notes).length > 0){
        threadMessage += '\n\n' + `*Notes* : \`\`\`${ JSON.stringify(actionData.notes, null, 4) }\`\`\``
    }

    if(actionData.inputs !== undefined && actionData.inputs !== null && Object.keys(actionData.inputs).length > 0){
        threadMessage += '\n\n' + `*Inputs* : \`\`\`${ JSON.stringify(actionData.inputs, null, 4) }\`\`\``
    }

    if(actionData.matrix !== undefined && actionData.matrix !== null && Object.keys(actionData.matrix).length > 0){
        threadMessage += '\n\n' + `*Matrix* : \`\`\`${ JSON.stringify(actionData.matrix, null, 4) }\`\`\``
    }

    if(actionData.steps !== undefined && actionData.steps !== null && Object.keys(actionData.steps).length > 0){
        var stepMessage = '\n\n' + '*Steps* : \n';

        function stepIcon(status) {
            if (status.toLowerCase() === 'success') return ':white_check_mark:';
            if (status.toLowerCase() === 'failure') return ':octagonal_sign:';
            if (status.toLowerCase() === 'cancelled') return ':no_entry:';
            if (status.toLowerCase() === 'skipped') return ':fast_forward:';
            return `:grey_question: ${status}`;
        }

        const steps = Object.keys(actionData.steps);
        for (const step of steps) {
          if (step != 'slack-message-ts') {
            var outcome = actionData.steps[step].outcome;
            stepMessage += `${stepIcon(outcome)} *${step}*\n`;
            if (outcome === 'failure') {
              stepMessage += '```' + JSON.stringify(actionData.steps[step], null, 4) + '```\n';
            }
          }
        }

        threadMessage += stepMessage
    }

    await slackClient.chat['postMessage']({
      channel: channelId,
      thread_ts: mainMessageId,
      text: threadMessage,
    });

    // Send the main message id back

    core.setOutput('message_id', mainMessageId);

  } catch (error) {
    core.setFailed(error);
  }
})();

async function findChannelIdFromName({ slackClient, actionChannelName }) {
    let result;
    const formattedChannelName = formatChannelName(actionChannelName);

    for await (const page of slackClient.paginate('conversations.list', { types: 'public_channel, private_channel' })) {
        const match = page.channels.find(c => c.name === formattedChannelName);
        if (match) {
        result = match.id;
            break;
        }
    }

    return result;
}
