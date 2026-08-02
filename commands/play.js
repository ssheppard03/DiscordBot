import { SlashCommandBuilder } from 'discord.js';
import { getVoiceChannel, hasVoicePermissions } from '../utils/voice.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song or add it to the queue')
  .addStringOption(option =>
    option.setName('query').setDescription('Song name or URL').setRequired(true),
  );

export async function execute(interaction, distube) {
  const voiceChannel = getVoiceChannel(interaction);
  if (!voiceChannel) {
    return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });
  }

  if (!hasVoicePermissions(voiceChannel, interaction.guild)) {
    return interaction.reply({
      content: 'I need permission to join and speak in your voice channel!',
    });
  }

  const query = interaction.options.getString('query', true);

  await interaction.deferReply();
  try {
    await distube.play(voiceChannel, query, {
      textChannel: interaction.channel,
      member: interaction.member,
    });
    await interaction.editReply(`🔎 Searching for **${query}**...`);
  } catch (error) {
    console.error('Distube play error:', error);
    const msg = error?.message || error?.toString() || 'Unknown error';
    await interaction.editReply(`❌ Failed to play: ${msg}`);
  }
}
