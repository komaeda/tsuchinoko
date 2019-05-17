const Discord = require('discord.js')
const client = new Discord.Client()

require('dotenv').config()

client.on('message', msg => {
  const re = /o?rin/i
  if (msg.author.id != process.env.DISCORD_ID && re.test(msg.content)) {
    msg.channel.send({
      files: ['https://cdn.discordapp.com/attachments/577547538081513494/578739914032676902/rinhq.gif']
    })
  }
})

client.login(process.env.DISCORD_TOKEN)

