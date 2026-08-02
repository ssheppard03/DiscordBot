import fs from 'node:fs';
import {
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
} from '@discordjs/voice';
import { getSoundFilePath } from './store.js';

const DESTROY_GRACE_MS = 5_000;
const pendingDestroys = new Map();

function clearPendingDestroy(guildId) {
  const timeout = pendingDestroys.get(guildId);
  if (timeout) {
    clearTimeout(timeout);
    pendingDestroys.delete(guildId);
  }
}

function scheduleDestroy(guildId, connection) {
  clearPendingDestroy(guildId);
  const timeout = setTimeout(() => {
    pendingDestroys.delete(guildId);
    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
      connection.destroy();
    }
  }, DESTROY_GRACE_MS);
  pendingDestroys.set(guildId, timeout);
}

async function playResourceAndWait(player, filename) {
  const resource = createAudioResource(fs.createReadStream(getSoundFilePath(filename)));
  player.play(resource);
  await entersState(player, AudioPlayerStatus.Idle, 30_000).catch(() => {});
}

async function playViaDisTube(queue, sound) {
  const dtVoice = queue.voice;
  const tempPlayer = createAudioPlayer();
  dtVoice.connection.subscribe(tempPlayer);
  try {
    await playResourceAndWait(tempPlayer, sound.filename);
  } finally {
    dtVoice.connection.subscribe(dtVoice.audioPlayer);
    tempPlayer.stop();
  }
}

async function playStandalone(voiceChannel, sound) {
  const guildId = voiceChannel.guild.id;
  clearPendingDestroy(guildId);

  let connection = getVoiceConnection(guildId);
  if (!connection || connection.state.status === VoiceConnectionStatus.Destroyed) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: true,
    });
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
  }

  const player = connection.state.subscription?.player ?? createAudioPlayer();
  if (!connection.state.subscription) {
    connection.subscribe(player);
  }

  await playResourceAndWait(player, sound.filename);
  scheduleDestroy(guildId, connection);
}

export async function playSound(client, voiceChannel, sound) {
  const queue = client.distube.getQueue(voiceChannel.guild.id);

  if (queue) {
    if (queue.voiceChannel.id !== voiceChannel.id) {
      throw new Error('busy-elsewhere');
    }
    return playViaDisTube(queue, sound);
  }

  return playStandalone(voiceChannel, sound);
}
