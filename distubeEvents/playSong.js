import { Events } from 'distube';

export const name = Events.PLAY_SONG;

export function execute(queue, song) {
  queue.textChannel?.send(`🎶 Playing: **${song.name}**`);
}
