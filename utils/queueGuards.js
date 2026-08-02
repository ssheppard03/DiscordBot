import { getVoiceChannel } from './voice.js';

export async function requireQueue(interaction, distube) {
  const queue = distube.getQueue(interaction.guildId);
  if (!queue) {
    await interaction.reply({ content: 'Nothing is currently playing!' });
    return null;
  }
  return queue;
}

export async function requireSameVoiceChannel(interaction, queue) {
  const voiceChannel = getVoiceChannel(interaction);
  if (!voiceChannel || voiceChannel.id !== queue.voiceChannel?.id) {
    await interaction.reply({
      content: 'You must be in the same voice channel as the bot to do that!',
    });
    return false;
  }
  return true;
}
