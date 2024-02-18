import discord
import responses

async def send_message(message, user_message):
    try:
        response = responses.handle_response(user_message)
        await message.channel.send(response)
    except Exception as e:
        print(e)

    
def run_discord_bot():
    TOKEN = 'MTIwODY0MDgyODQxMTc0NDM1Ng.GorfCw.iwKQdLcwt-Hwvwohb985-qEI-P6YTxP-o6SPDw'
    intents = discord.Intents.default()
    client = discord.Client(intents=intents)

    @client.event
    async def on_ready():
        print(f'{client.user} is running')

    @client.event
    async def on_message(message):
        if message.author == client.user:
            return

        username = str(message.author).split('#')[0]
        user_message = str(message.content)
        channel = str(message.channel.name)

        print(f'{username} said: {user_message} in {channel}')
        if user_message.startswith("/"):
            user_message = user_message[1:]
            await send_message(message, user_message)

    client.run(TOKEN)

run_discord_bot()
