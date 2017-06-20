const discord = require('discord.js')
const search = require('fuzzysearch')
const buttons = require('./buttons.json')
const version = require('./package.json').version
const path = require('path')

const helpMsg = `Commands:

> __help__: Show this message.
> __join__: Join the voice channel you're currently in.
> __leave__: Leave the voice channel.
> __list__: List available sounds.
> __play__: Play a sound. Auto-completes.
> __stop__: Stop any music playback.
> __rip__: Play a high-quality rip from YouTube.

Made by penny. Version ${version}.`

require('dotenv').config()

const b = new discord.Client()

b.on('message', message => {
  if (message.content.split(' ')[0] === `<@${process.env.BOT_ID}>` || message.content.split(' ')[0] === `<@!${process.env.BOT_ID}>`) {
    delegate(b, message)
  }
})

// b.on('ready', () => {
//   let channel = b.channels.find(ch => ch.name = 'buzzfeed')
//   b.sendMessage(channel, 'Arin Hanson is ready.')
// })

const delegate = (b, msg) => {
  const splitted = msg.content.split(' ')
  const command = splitted[1]

  switch (command) {
    case 'help':
      b.sendMessage(msg.channel, helpMsg)
      break
    case 'join':
      joinVoice(b, msg)
      break
    case 'leave':
      leaveVoice(b, msg)
      break
    case 'list':
      listButtons(b, msg)
      break
    case 'play':
      playSound(b, msg)
      break
    case 'stop':
      stopPlaying(b, msg)
      break
    case 'rip':
      playRip(b, msg)
      break
    case 'nick':
      changeNick(b, msg)
      break
  }
}

const changeNick = (b, msg) => {
  let rest = msg.content.split(' ').slice(2).join(' ')
  b.setNickname(msg.server, rest)
}

const joinVoice = (b, msg) => {
  if (!msg.author.voiceChannel) {
    b.sendMessage(msg.channel, 'How am I supposed to join a voice channel when you\'re not in one?')
    return
  }
  if (b.voiceConnections.has('server', msg.server)) {
    b.sendMessage(msg.channel, 'I\'m already in a voice channel.')
    return
  }
  b.joinVoiceChannel(msg.author.voiceChannel, (err, conn) => {
    b.sendMessage(msg.channel, `joined \`${conn.voiceChannel.name}\``)
  })
}

const leaveVoice = (b, msg) => {
  if (!b.voiceConnections.has('server', msg.server)) {
    b.sendMessage(msg.channel, 'I\'m not even connected to a voice channel here.')
    return
  }
  let vc = b.voiceConnections.get('server', msg.server)
  vc.stopPlaying()
  let vcname = b.voiceConnections.get('server', msg.server).voiceChannel.name
  b.leaveVoiceChannel(b.voiceConnections.get('server', msg.server).voiceChannel, err => {
    b.sendMessage(msg.channel, `left \`${vc.voiceChannel.name}\``)
  })
}

const playSound = (b, msg) => {
  if (!b.voiceConnections.has('server', msg.server)) {
    b.sendMessage(msg.channel, 'I\'m not even in a voice channel.')
    return
  }
  let vc = b.voiceConnections.get('server', msg.server)
  let rest = msg.content.split(' ').slice(2).join(' ')
  let match = buttons.filter(e => {
    let r = search(rest.toLowerCase(), e.name.toLowerCase())
    return r
  })[0]
  if (!match) {
    b.sendMessage(msg.channel, 'Couldn\'t find a match!')
    return
  }
  vc.playFile(path.join('./mp3', match.source))
}

const stopPlaying = (b, msg) => {
  if (!b.voiceConnections.has('server', msg.server)) {
    b.sendMessage(msg.channel, 'I\'m not even in a voice channel.')
    return
  }
  let vc = b.voiceConnections.get('server', msg.server)
  vc.stopPlaying()
}

const listButtons = (b, msg) => {
  let res = ''
  buttons.forEach(e => {
    res += `_${e.name}_\n`
  })
  b.sendMessage(msg.channel, res)
}

b.loginWithToken(process.env.BOT_TOKEN)
