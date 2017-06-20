const discord = require('discord.js')
const search = require('fuzzysearch')
const path = require('path')

const buttons = require('./buttons.json')

const helpMsg = `Commands:

> __help__: Show this message.
> __join__: Join the voice channel you're currently in.
> __leave__: Leave the voice channel.
> __list__: List available sounds.
> __play__: Play a sound. Auto-completes.
> __stop__: Stop any music playback.
`

require('dotenv').config()

const client = new discord.Client()

client.on('ready', () => {
  // let channel = client.channels.find(ch => ch.name = 'buzzfeed')
  // channel.send('aaron carter can suck my dick')
  console.log('arin hanson is ready to die')
})

client.on('message', message => {
  const regex = new RegExp(`<@!?${process.env.BOT_ID}>`)
  if (regex.test(message)) {
    delegate(message)
  }
})

function delegate (msg) {
  const splitted = msg.content.split(' ')
  const command = splitted[1]

  switch (command) {
    case 'help':
      msg.reply(helpMsg)
      break
    case 'join':
      joinVoice(msg)
      break
    case 'leave':
      leaveVoice(msg)
      break
    case 'list':
      listButtons(msg)
      break
    case 'play':
      playButton(msg)
      break
  }
}

function joinVoice (msg) {
  if (!msg.member.voiceChannel) {
    msg.reply('you\'re not in a voice channel.')
    return
  }
  msg.member.voiceChannel.join().then(conn => {
    msg.reply(`joined \`${msg.member.voiceChannel.name}\``)
  })
}

function leaveVoice (msg) {
  if (!client.voiceConnections.exists('channel', msg.member.voiceChannel.connection.channel)) {
    msg.reply('I\'m not even connected to a voice channel.')
    return
  }

  const vc = client.voiceConnections.find('channel', msg.member.voiceChannel.connection.channel)
  vc.disconnect()
}

function listButtons (msg) {
  const res = buttons.reduce((acc, val) => {
    return acc += `_${val.name}_\n`
  }, '')
  msg.reply(`\n${res}`)
}

function playButton (msg) {
  if (!client.voiceConnections.exists('channel', msg.member.voiceChannel.connection.channel)) {
    msg.reply('I\'m not even in a voice channel.')
    return
  }

  const vc = client.voiceConnections.find('channel', msg.member.voiceChannel.connection.channel)
  const rest = msg.content.split(' ').slice(2).join(' ')
  const match = buttons.filter(btn => {
    return search(rest.toLowerCase(), btn.name.toLowerCase())
  })[0]
  if (!match) {
    msg.reply('couldn\'t find a match!')
    return
  }
  vc.playFile(path.join('./mp3', match.source))
}

client.login(process.env.BOT_TOKEN)
