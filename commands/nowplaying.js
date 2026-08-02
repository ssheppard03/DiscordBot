import { SlashCommandBuilder } from 'discord.js';
import { requireQueue } from '../utils/queueGuards.js';
import { buildNowPlayingEmbed } from '../utils/formatSong.js';

export const data = new SlashCommandBuilder().setName('nowplaying').setDescription('Show the currently playing song');

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;

  await interaction.reply({ embeds: [buildNowPlayingEmbed(queue)] });
}
