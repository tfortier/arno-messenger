const repository = {
    name: 'notify-through-slack',
    owner: {
      login: 'Testuser',
    },
};
  
export const GITHUB_PUSH_EVENT = {
    context: {
        payload: {
            repository,
        },
        actor: 'testuser',
        action: 'testaction',
        workflow: 'testworkflow',
        ref: 'refs/heads/my-branch',
        eventName: 'push',
        sha: 'abc123',
    },
};
  
export const GITHUB_PR_EVENT = {
    context: {
        payload: {
            repository,
            pull_request: {
                html_url: 'https://github.com/demo_user/demo_repo/pulls/1',
                title: 'This is a PR',
                head: {
                ref: 'my-branch',
                sha: 'xyz678',
                },
            },
        },
        actor: 'testuser',
        action: 'testaction',
        workflow: 'testworkflow',
        eventName: 'pull_request',
        sha: 'abc123',
    },
};
  