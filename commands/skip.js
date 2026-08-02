import { SlashCommandBuilder } from 'discord.js';
import { requireQueue, requireSameVoiceChannel } from '../utils/queueGuards.js';

export const data = new SlashCommandBuilder().setName('skip').setDescription('Skip the current song');

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;
  if (!(await requireSameVoiceChannel(interaction, queue))) return;

  const song = await queue.skip();
  await interaction.reply(`⏭️ Skipped! Now playing **${song.name}**`);
}
