import { EmbedBuilder } from 'discord.js';

export function buildQueueEmbed(queue) {
  const [current, ...upcoming] = queue.songs;
  const upcomingList = upcoming
    .slice(0, 10)
    .map((song, i) => `**${i + 1}.** ${song.name} - ${song.formattedDuration}`)
    .join('\n');
  const extra = upcoming.length > 10 ? `\n+${upcoming.length - 10} more` : '';

  return new EmbedBuilder()
    .setTitle('Queue')
    .setDescription(`**Now Playing:** ${current.name} - ${current.formattedDuration}\n\n${upcomingList}${extra}`)
    .setFooter({ text: `Total duration: ${queue.formattedDuration}` });
}

export function buildNowPlayingEmbed(queue) {
  const song = queue.songs[0];
  return new EmbedBuilder()
    .setTitle('Now Playing')
    .setDescription(`[${song.name}](${song.url})`)
    .addFields(
      { name: 'Time', value: `${queue.formattedCurrentTime} / ${song.formattedDuration}`, inline: true },
      { name: 'Requested by', value: `${song.member ?? 'Unknown'}`, inline: true },
    );
}
