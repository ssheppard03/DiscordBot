import 'dotenv/config';
import ffmpeg from 'ffmpeg-static';
import fs from 'fs';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { DisTube } from 'distube';
import { SpotifyPlugin } from '@distube/spotify';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { YouTubePlugin } from '@distube/youtube';

// Setup client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Setup spotify
const spotify = new SpotifyPlugin({
  api: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  }
});

// Setup youtube
const youtube = new YouTubePlugin({
  cookies: JSON.parse(fs.readFileSync("cookies.json")),
});


const ffmpegPath = "/usr/bin/ffmpeg";

// Setup DisTube
const distube = new DisTube(client, {
  joinNewVoiceChannel: true,
  emitNewSongOnly: true,
  nsfw: true,
  emitAddSongWhenCreatingQueue: true,
  ffmpeg: {path: ffmpegPath, alwaysCreateProcess: true, ffmpegArgs: ['-loglevel', 'debug']},
  plugins: [spotify, new SoundCloudPlugin(), youtube]
});

client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Handle messages
client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'play') {
      const voiceChannel = message.member?.voice.channel;
      if (!voiceChannel) return message.channel.send("You must be in a voice channel!");

      const botPermissions = voiceChannel.permissionsFor(message.guild.members.me);

      if (!botPermissions?.has(['Connect', 'Speak'])) {
          return message.channel.send("I need permission to join and speak in your voice channel!");
      }

      const query = args.join(" ");
      if (!query) return message.channel.send("Please provide a song name or URL!");
      try {
          await distube.play(voiceChannel, query, {
              message,
              textChannel: message.channel,
              member: message.member,
          });
      } catch (error) {
          const msg = error?.message || error?.toString() || 'Unknown error';
          console.error('Distube play error:', error);
          message.channel.send(`❌ Failed to play: ${msg}`);
      }
  }


  const queue = distube.getQueue(message.guildId);

  if (command === 'stop') {
    if (!queue) return message.channel.send("Nothing is playing!");
    await queue.stop();
    message.channel.send("Stopped the player!");
  }
});

// message output
distube
  .on("play_song", (queue, song) => queue.textChannel.send(`🎶 Playing: **${song.name}**`))
  .on("add_song", (queue, song) => queue.textChannel.send(`✅ Added: ${song.name}`))
  .on("error", (channel, error) => {
    console.log("==== Distube error event ====");
    console.log("Channel:", channel ? channel.name : "undefined");
    console.log("Error / Queue object:", error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);