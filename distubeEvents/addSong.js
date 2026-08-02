import { Events } from 'distube';

export const name = Events.ADD_SONG;

export function execute(queue, song) {
  queue.textChannel?.send(`✅ Added: ${song.name}`);
}
