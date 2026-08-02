import { Events } from 'distube';

export const name = Events.ERROR;

export function execute(error, queue, song) {
  console.error('DisTube error:', error);
  const context = song ? ` while playing **${song.name}**` : '';
  queue?.textChannel?.send(`❌ An error occurred${context}: ${error.message}`).catch(() => {});
}
