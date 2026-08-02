import { SlashCommandBuilder } from 'discord.js';
import { requireQueue, requireSameVoiceChannel } from '../utils/queueGuards.js';

export const data = new SlashCommandBuilder().setName('pause').setDescription('Pause the current song');

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;
  if (!(await requireSameVoiceChannel(interaction, queue))) return;

  await queue.pause();
  await interaction.reply('⏸️ Paused!');
}
