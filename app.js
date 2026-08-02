import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { DisTube } from 'distube';
import { SpotifyPlugin } from '@distube/spotify';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { YtDlpPlugin } from '@distube/yt-dlp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// Setup youtube
const youtube = new YtDlpPlugin();


const ffmpegPath = "/usr/bin/ffmpeg";

// Setup DisTube
const distube = new DisTube(client, {
  joinNewVoiceChannel: true,
  emitNewSongOnly: true,
  nsfw: true,
  emitAddSongWhenCreatingQueue: true,
  ffmpeg: {path: ffmpegPath, alwaysCreateProcess: true, ffmpegArgs: ['-loglevel', 'debug']},
  plugins: [new SoundCloudPlugin(), youtube]
});

client.distube = distube;

// Load slash commands
client.commands = new Collection();
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))) {
  const command = await import(pathToFileURL(path.join(commandsDir, file)).href);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] commands/${file} is missing "data" or "execute".`);
  }
}

// Load discord.js client events
const eventsDir = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsDir).filter(f => f.endsWith('.js'))) {
  const event = await import(pathToFileURL(path.join(eventsDir, file)).href);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Load DisTube events
const distubeEventsDir = path.join(__dirname, 'distubeEvents');
for (const file of fs.readdirSync(distubeEventsDir).filter(f => f.endsWith('.js'))) {
  const event = await import(pathToFileURL(path.join(distubeEventsDir, file)).href);
  distube.on(event.name, (...args) => event.execute(...args));
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
