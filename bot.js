const discord = require('discord.js')
const search = require('fuzzysearch')
const exec = require('execa')
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
> __say__: Say something.
> __sayv__: Say something, accepts a macOS "say" voice as parameter.

Root commands:

> __/as__: Say something, alias of "/a say".
> __/af__: Say something with a female voice.
> __/tranter__: Say something with a British male voice.
`

require('dotenv').config()
const client = new discord.Client()

client.on('ready', () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })
  let channel = client.channels.find(ch => ch.name === 'general')
  rl.on('line', line => {
    channel.send(line, { tts: true })
  })
  console.log('tsuchinoko is ready to die')
})

client.on('message', message => {
  const regex = new RegExp('^\/a')
  const sayregex = new RegExp('^\/as')
  const voiceregex = new RegExp('^\/af')
  const tranterregex = new RegExp('^\/tranter')
  if (/corndogg/ig.test(message)) {
    message.channel.send("https://cdn.discordapp.com/attachments/178176400388259840/422540511761399819/ixautI0.jpg")
  }
  if (sayregex.test(message.content)) {
    say(message, 1, "Alex", () => {})
  } else if (voiceregex.test(message.content)) {
    say(message, 1, "Fiona", () => {})
  } else if (tranterregex.test(message.content)) {
    say(message, 1, "Daniel", () => {})
  } else if (regex.test(message.content)) {
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
    case 'sayv':
      const voice = msg.content.split(' ')[2]
      say(msg, 3, voice, () => {})
      break
    case 'say':
      say(msg, 2, "Alex", () => {})
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
    msg.content = '/a Tsuchinoko is ready!'
    say(msg, 1, "Karen", () => {})
  })
}

function leaveVoice (msg) {
  if (!client.voiceConnections.exists('channel', msg.member.voiceChannel.connection.channel)) {
    msg.reply('I\'m not even connected to a voice channel.')
    return
  }

  msg.content = '/a tsuchinoko out'
  say(msg, 1, "Karen", () => {
    const vc = client.voiceConnections.find('channel', msg.member.voiceChannel.connection.channel)
    vc.disconnect()
  })

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

function say (msg, sliceIndex, voice = "Alex", cb) {
  const eRegex = new RegExp('487614747156676609')
  if (!client.voiceConnections.exists('channel', msg.member.voiceChannel.connection.channel)) {
    msg.reply('I\'m not even in a voice channel.')
    return
  }

  const vc = client.voiceConnections.find('channel', msg.member.voiceChannel.connection.channel)
  let rest = msg.content.split(' ').slice(sliceIndex).join(' ')
  if (eRegex.test(rest)) {
    rest = `OK I ADMIT IT I LOVE YOU OK i fucking love you and it breaks my heart when i see you play with someone else or anyone commenting in your profile i just want to be your boyfriend and put a heart in my profile linking to your profile and have a walltext of you commenting cute things i want to play video games talk in discord all night and watch a movie together but you just seem so uninterested in me it fucking kills me and i cant take it anymore i want to remove you but i care too much about you so please i'm begging you to either love me back or remove me and NEVER contact me again it hurts so much to say this because i need you by my side but if you don't love me then i want you to leave because seeing your icon in my friendlist would kill me everyday of my pathetic life`
  }
  voice = voice.replace(/(["\s'$`\\])/g,'\\$1')
  rest = rest.replace(/(["\s'$`\\])/g,'\\$1')
  exec.shell(`say -v ${voice} "${rest}" -o temp.aiff`).then(() => {
    return exec.shell(`lame -m m temp.aiff temp.mp3`)
  }).then(() => {
    const status = vc.playFile('./temp.mp3')
    status.on('end', () => cb())
  }).catch(err => {
    console.log(err)
  })
}

client.login(process.env.BOT_TOKEN)
