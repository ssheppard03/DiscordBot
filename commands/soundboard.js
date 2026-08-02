import { SlashCommandBuilder } from 'discord.js';
import { listSounds } from '../soundboard/store.js';
import { buildSoundboardPage } from '../soundboard/ui.js';

export const data = new SlashCommandBuilder().setName('soundboard').setDescription('Show the soundboard');

export async function execute(interaction) {
  await interaction.reply(buildSoundboardPage(listSounds(), 0));
}
