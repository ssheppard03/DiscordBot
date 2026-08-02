import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { REST, Routes } from 'discord.js';

const usingTestServer = true;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsDir = path.join(__dirname, 'commands');

const commands = [];
for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))) {
  const command = await import(pathToFileURL(path.join(commandsDir, file)).href);
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Guild-scoped registration - updates instantly, only visible in GUILD_ID.
await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, usingTestServer ? process.env.TEST_GUILD_ID : process.env.REAL_GUILD_ID),
  { body: commands },
);

// Global registration - works in every server the bot is in, but can take
// up to ~1 hour to propagate (vs instant for guild-scoped).
// await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

console.log(`Successfully registered ${commands.length} guild commands.`);
