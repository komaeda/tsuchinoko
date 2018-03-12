const discord = require('discord.js')
const search = require('fuzzysearch')
const speak = require('espeak')
const path = require('path')
const readline = require('readline')

const buttons = require('./buttons.json')

require('dotenv').config()

const helpMsg = `Commands:

> __help__: Show this message.
> __join__: Join the voice channel you're currently in.
> __leave__: Leave the voice channel.
> __list__: List available sounds.
> __play__: Play a sound. Auto-completes.
> __stop__: Stop any music playback.
`

const responses = [
  'https://pbs.twimg.com/media/CaEyqFvUkAAdzum.jpg',
  'https://s-media-cache-ak0.pinimg.com/564x/87/5c/ce/875cce9c0185391b3747ede46b2fb827.jpg',
  'http://i3.kym-cdn.com/entries/icons/original/000/020/597/CaEyqJJUcAA60xu.jpg',
  'http://i3.kym-cdn.com/entries/icons/original/000/020/597/CaEyqJJUcAA60xu.jpg',
  'https://vignette4.wikia.nocookie.net/megamitensei/images/3/33/Rise_Kujikawa_render.png/revision/latest?cb=20120401110434',
  'https://pbs.twimg.com/media/DERI1PZUwAA6_42.jpg'
]

require('dotenv').config()
const client = new discord.Client()

client.on('ready', () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })
  let channel = client.channels.find(ch => ch.name === 'buzzfeed')
  rl.on('line', line => {
    channel.send(line, { tts: true })
  })
  console.log('arin hanson is ready to die')
})

client.on('message', message => {
  const regex = new RegExp(`<@!?${process.env.BOT_ID}>`)
  const hell = /arin(\s+hanson)?/ig
  if (hell.test(message)) {
    message.channel.send(responses[Math.floor(Math.random() * responses.length)])
  }
  if (/corndogg/ig.test(message)) {
    message.channel.send("https://cdn.discordapp.com/attachments/178176400388259840/422540511761399819/ixautI0.jpg")
  }
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
    case 'say':
      say(msg)
      break
    case 'die':
      die(msg)
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

function say (msg) {
  if (!client.voiceConnections.exists('channel', msg.member.voiceChannel.connection.channel)) {
    msg.reply('I\'m not even in a voice channel.')
    return
  }

  const vc = client.voiceConnections.find('channel', msg.member.voiceChannel.connection.channel)
  const rest = msg.content.split(' ').slice(2).join(' ')
  if (rest.length > 20) {
    msg.reply('I have a small brain, please keep your message under 20 characters.')
    return
  }
  speak.speak(rest, (err, wav) => {
    if (err) console.log(err)

    vc.playArbitraryInput(wav.toDataUri())
  })
}

client.login(process.env.BOT_TOKEN)
