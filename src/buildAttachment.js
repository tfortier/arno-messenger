function buildActorLink(actor){

    const githubToSlack = {
        dominiclabbe: 'dlabbe',
        flambert: 'flambert',
        guillaumeaudet: 'gaudet',
        jdtremblay : 'jd',
        mbaron: 'mbaron',
        PhilippeBettez: 'pbettez',
        romarickb: 'romaric',
        tfortier: 'tfortier',
        valdesekamdem: 'KKV'
    }

    return {
        title: 'Actor',
        value: `:github: <https://github.com/${actor} | ${actor}> /  :slack: @${githubToSlack[actor]}`,
        short: true,
    }
}

function buildReferenceLink(githubData){
    if(githubData.eventName === 'pull_request'){
        return {
            title: 'Pull Request',
            value: `<${githubData.payload.pull_request.html_url} | ${githubData.payload.pull_request.title}>`,
            short: true,
        }
    }else{
        return {
            title: 'Branch',
            value: `<${githubData.repositoryUrl}/actions/runs/${githubData.runId} | ${githubData.branch}>`,
            short: true,
        }
    }
}

function selectColor(status) {
    switch(status) {
        case 'failure':
            return "danger"
            break;
        case 'running':
            return "warning"
            break;
        case 'success':
            return "good"
            break;
        default:
            return "default"
    }
}

function buildAttachment({actionData, githubData}){

    const fields = [
        buildReferenceLink(githubData),
        buildActorLink(githubData.actor),
    ]

    if(actionData.notes !== undefined && actionData.notes !== null && actionData.notes !== ""){
        fields.push({
            title: 'Notes',
            value: actionData.notes,
            short: false,
        });
    }

    return [
        {
            color: selectColor(actionData.status),
            fields: fields,
            footer_icon: 'https://github.githubassets.com/favicon.ico',
            footer: `<${githubData.repositoryUrl} | ${githubData.repositoryName}>`,
            ts: Math.floor(Date.now() / 1000),
        },
    ];
}

module.exports.buildAttachment = buildAttachment;
