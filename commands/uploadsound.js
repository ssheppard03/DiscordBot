import { SlashCommandBuilder } from 'discord.js';
import { createUploadSession } from '../soundboard/uploadSessions.js';
import { buildUploadModal } from '../soundboard/ui.js';

const MAX_BYTES = 8 * 1024 * 1024;

export const data = new SlashCommandBuilder()
  .setName('uploadsound')
  .setDescription('Add a new sound to the shared soundboard')
  .addAttachmentOption(option => option.setName('file').setDescription('MP3 file').setRequired(true));

export async function execute(interaction) {
  const attachment = interaction.options.getAttachment('file', true);

  const looksLikeMp3 = attachment.contentType?.includes('audio') || /\.mp3$/i.test(attachment.name ?? '');
  if (!looksLikeMp3) {
    return interaction.reply({ content: "❌ That doesn't look like an mp3 file.", ephemeral: true });
  }
  if (attachment.size > MAX_BYTES) {
    return interaction.reply({ content: '❌ File is too large (max 8MB).', ephemeral: true });
  }

  createUploadSession(interaction.id, { url: attachment.url, name: attachment.name });

  await interaction.showModal(buildUploadModal(interaction.id));
}
