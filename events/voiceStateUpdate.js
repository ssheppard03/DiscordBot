import { Events } from 'discord.js';
import { isVoiceChannelEmpty } from 'distube';

export const name = Events.VoiceStateUpdate;

export async function execute(oldState) {
  if (!isVoiceChannelEmpty(oldState)) return;

  const queue = oldState.client.distube.getQueue(oldState.guild.id);
  if (queue) await queue.stop();
}
