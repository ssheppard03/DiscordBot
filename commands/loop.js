import { SlashCommandBuilder } from 'discord.js';
import { RepeatMode } from 'distube';
import { requireQueue, requireSameVoiceChannel } from '../utils/queueGuards.js';

const MODES = {
  off: { value: RepeatMode.DISABLED, label: 'Off' },
  song: { value: RepeatMode.SONG, label: 'Song' },
  queue: { value: RepeatMode.QUEUE, label: 'Queue' },
};

export const data = new SlashCommandBuilder()
  .setName('loop')
  .setDescription('Set the loop mode')
  .addStringOption(option =>
    option
      .setName('mode')
      .setDescription('Loop mode')
      .setRequired(true)
      .addChoices(
        { name: 'Off', value: 'off' },
        { name: 'Song', value: 'song' },
        { name: 'Queue', value: 'queue' },
      ),
  );

export async function execute(interaction, distube) {
  const queue = await requireQueue(interaction, distube);
  if (!queue) return;
  if (!(await requireSameVoiceChannel(interaction, queue))) return;

  const mode = MODES[interaction.options.getString('mode', true)];
  queue.setRepeatMode(mode.value);
  await interaction.reply(`🔁 Loop mode set to **${mode.label}**`);
}
