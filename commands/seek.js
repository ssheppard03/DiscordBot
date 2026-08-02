import { SlashCommandBuilder } from 'discord.js';
import { requireQueue, requireSameVoiceChannel } from '../utils/queueGuards.js';

export const data = new SlashCommandBuilder()
  .setName('seek')
  .setDescription('Seek to a position in the current song')
  .addIntegerOption(option =>
    option.setName('seconds').setDescription('Position in seconds').setRequired(true).setMinValue(0),
  );

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;
  if (!(await requireSameVoiceChannel(interaction, queue))) return;

  const seconds = interaction.options.getInteger('seconds', true);
  await queue.seek(seconds);
  await interaction.reply(`⏩ Seeked to ${seconds}s`);
}
