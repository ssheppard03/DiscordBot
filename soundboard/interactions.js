import fs from 'node:fs/promises';
import { ButtonBuilder } from 'discord.js';
import { getVoiceChannel, hasVoicePermissions } from '../utils/voice.js';
import { consumeUploadSession } from './uploadSessions.js';
import { buildSoundboardPage } from './ui.js';
import { parseEmojiForButton } from './emoji.js';
import { addSound, generateId, getSound, getSoundFilePath, listSounds } from './store.js';
import { playSound } from './playback.js';

export async function handleButton(interaction) {
  const [, action, payload] = interaction.customId.split(':');

  if (action === 'page') {
    const targetPage = Number(payload);
    return interaction.update(buildSoundboardPage(listSounds(), targetPage));
  }

  if (action === 'play') {
    const sound = getSound(payload);
    if (!sound) {
      return interaction.reply({ content: '❌ That sound no longer exists.', ephemeral: true });
    }

    const voiceChannel = getVoiceChannel(interaction);
    if (!voiceChannel) {
      return interaction.reply({ content: 'Join a voice channel first!', ephemeral: true });
    }
    if (!hasVoicePermissions(voiceChannel, interaction.guild)) {
      return interaction.reply({ content: 'I need Connect + Speak permission there!', ephemeral: true });
    }

    await interaction.deferUpdate();
    try {
      await playSound(interaction.client, voiceChannel, sound);
    } catch (error) {
      if (error.message === 'busy-elsewhere') {
        await interaction.followUp({
          content: "❌ I'm already playing music in a different voice channel in this server.",
          ephemeral: true,
        });
      } else {
        console.error('Soundboard playback error:', error);
        await interaction.followUp({ content: '❌ Failed to play that sound.', ephemeral: true });
      }
    }
  }
}

export async function handleModalSubmit(interaction) {
  const [, , token] = interaction.customId.split(':');
  const session = consumeUploadSession(token);
  if (!session) {
    return interaction.reply({ content: '❌ This upload session expired — run `/uploadsound` again.', ephemeral: true });
  }

  const name = interaction.fields.getTextInputValue('name').trim();
  const emoji = interaction.fields.getTextInputValue('emoji').trim();

  try {
    new ButtonBuilder().setEmoji(parseEmojiForButton(emoji));
  } catch {
    return interaction.reply({ content: "❌ That doesn't look like a valid emoji, try again.", ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  try {
    const response = await fetch(session.url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const id = generateId();
    const filename = `${id}.mp3`;
    await fs.writeFile(getSoundFilePath(filename), buffer);
    addSound({ id, name, emoji, filename, addedBy: interaction.user.id });
    await interaction.editReply(`✅ Added **${name}** ${emoji} to the soundboard!`);
  } catch (error) {
    console.error('Soundboard upload error:', error);
    await interaction.editReply('❌ Failed to save that sound.');
  }
}
