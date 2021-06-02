function formatChannelName(channelName) {
    return channelName.replace(/[#@]/g, '');
}
  
module.exports.formatChannelName = formatChannelName;