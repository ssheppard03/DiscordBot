import { SlashCommandBuilder } from 'discord.js';
import { requireQueue, requireSameVoiceChannel } from '../utils/queueGuards.js';

export const data = new SlashCommandBuilder().setName('stop').setDescription('Stop playback and clear the queue');

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;
  if (!(await requireSameVoiceChannel(interaction, queue))) return;

  await queue.stop();
  await interaction.reply('⏹️ Stopped the player!');
}
