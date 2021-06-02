# ARNO Messenger

## Requirements

For Arno to do it's job properly you will need the following :

-   The channel ID of the Slack Channel you want to post in.
-   A Slack App and Bot with the `chat:write` scope to send messages to your channel.
-   A Slack Bot Auth Token that you will pass as a secret.

### Important

Since Arno uses the Channel ID to identify where to post your messages you need to figure out that ID. You can find the ID through an API calls or [use the trick described here](https://stackoverflow.com/questions/40940327/what-is-the-simplest-way-to-find-a-slack-team-id-and-a-channel-id).
