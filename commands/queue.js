import { SlashCommandBuilder } from 'discord.js';
import { requireQueue } from '../utils/queueGuards.js';
import { buildQueueEmbed } from '../utils/formatSong.js';

export const data = new SlashCommandBuilder().setName('queue').setDescription('Show the current queue');

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;

  await interaction.reply({ embeds: [buildQueueEmbed(queue)] });
}
