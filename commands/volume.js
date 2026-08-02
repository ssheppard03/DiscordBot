import { SlashCommandBuilder } from 'discord.js';
import { requireQueue, requireSameVoiceChannel } from '../utils/queueGuards.js';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription('Set the playback volume')
  .addIntegerOption(option =>
    option.setName('level').setDescription('Volume percentage (0-100)').setRequired(true).setMinValue(0).setMaxValue(100),
  );

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;
  if (!(await requireSameVoiceChannel(interaction, queue))) return;

  const level = interaction.options.getInteger('level', true);
  queue.setVolume(level);
  await interaction.reply(`🔊 Volume set to ${level}%`);
}
