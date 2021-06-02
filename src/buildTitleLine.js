function convertStatusToEmoji(status){
    const statusEmoji = {
        running: ":loading:",
        success: ":white_check_mark:",
        failure: ":octagonal_sign:",
        cancelled: ":no_entry:",
        skipped: ":fast_forward:",
    }

    if(statusEmoji[status] !== undefined){
        return statusEmoji[status];
    }

    return status;
}

module.exports.convertStatusToEmoji = convertStatusToEmoji;

function buildTitleLine({actionData, githubData}){

    function prettifyString(string){
        const replacables = {
            fonse: ":bell_company: ",
            volt: ":virgin_mobile: ",
            bell: ":bell_company: ",
            virgin: " :virgin_mobile: ",
            job: `(${githubData.job}) `,
        }
    
        if(replacables[string] !== undefined){
            return replacables[string];
        }
    
        return string + " ";
    }

    return `${convertStatusToEmoji(actionData.status)} ` +
    `<${githubData.repositoryUrl}/commit/${githubData.commitSha}/checks | ${prettifyString(actionData.titlePrefix)} ${githubData.workflowName} ${prettifyString(actionData.titleSuffix)}> `;
}

module.exports.buildTitleLine = buildTitleLine;