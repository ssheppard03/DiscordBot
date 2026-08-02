import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { parseEmojiForButton } from './emoji.js';

const FULL_PAGE_SIZE = 25;
const PAGINATED_PAGE_SIZE = 20;

export function buildSoundboardPage(sounds, page = 0) {
  if (sounds.length === 0) {
    return { content: 'No sounds yet! Use `/uploadsound` to add one.', components: [] };
  }

  const paginated = sounds.length > FULL_PAGE_SIZE;
  const pageSize = paginated ? PAGINATED_PAGE_SIZE : FULL_PAGE_SIZE;
  const totalPages = Math.ceil(sounds.length / pageSize);
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const pageSounds = sounds.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize);

  const rows = [];
  for (let i = 0; i < pageSounds.length; i += 5) {
    const row = new ActionRowBuilder();
    for (const sound of pageSounds.slice(i, i + 5)) {
      try {
        const button = new ButtonBuilder()
          .setCustomId(`soundboard:play:${sound.id}`)
          .setLabel(sound.name)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(parseEmojiForButton(sound.emoji));
        row.addComponents(button);
      } catch (error) {
        console.warn(`Soundboard: skipping sound "${sound.name}" (${sound.id}), bad emoji:`, error.message);
      }
    }
    if (row.components.length) rows.push(row);
  }

  if (paginated) {
    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`soundboard:page:${clampedPage - 1}`)
          .setLabel('◀ Prev')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(clampedPage === 0),
        new ButtonBuilder()
          .setCustomId(`soundboard:page:${clampedPage + 1}`)
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(clampedPage === totalPages - 1),
      ),
    );
  }

  const content = paginated ? `**Soundboard** (page ${clampedPage + 1}/${totalPages})` : '**Soundboard**';
  return { content, components: rows };
}

export function buildUploadModal(sessionToken) {
  return new ModalBuilder()
    .setCustomId(`soundboard:upload:${sessionToken}`)
    .setTitle('Sound Details')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel('Name')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(32),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('emoji')
          .setLabel('Emoji (unicode or :custom:)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(60),
      ),
    );
}
