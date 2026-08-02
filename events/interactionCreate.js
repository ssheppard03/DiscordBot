import { Events } from 'discord.js';
import { handleButton, handleModalSubmit } from '../soundboard/interactions.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      return await command.execute(interaction, interaction.client.distube);
    }

    if (interaction.isButton() && interaction.customId.startsWith('soundboard:')) {
      return await handleButton(interaction);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('soundboard:')) {
      return await handleModalSubmit(interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    const payload = { content: '❌ Something went wrong.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload).catch(() => {});
    } else if (interaction.isRepliable()) {
      await interaction.reply(payload).catch(() => {});
    }
  }
}
