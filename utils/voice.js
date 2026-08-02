import { PermissionFlagsBits } from 'discord.js';

export function getVoiceChannel(interaction) {
  return interaction.member?.voice?.channel ?? null;
}

export function hasVoicePermissions(voiceChannel, guild) {
  const permissions = voiceChannel.permissionsFor(guild.members.me);
  return permissions?.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]) ?? false;
}
