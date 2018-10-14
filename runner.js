var casper = require('casper').create({
  onPageInitialized: function () {
    this.evaluate(function () {
      window.navigator = {
        plugins: {
            length: 1,
            'Shockwave Flash': {
                description: 'fakeflash'
            }
        }
      }
    })
  }
})

casper.start('http://www.acapela-group.com/')

casper.wait(1000, function () {
  this.page.switchToChildFrame(0)
  this.fillSelectors('form#typetalkdemo', {
    'select[name="MySelectedVoice"]': 'WillLittleCreature (emotive voice)',
    'textarea[name="MyTextForTTS"]': 'hello',
    'input#agreeterms': true
  }, false)
  this.click('#listen')
  this.wait(2000, function () {
    this.page.switchToChildFrame(0)
    this.echo(this.getHTML())
    const url = this.getElementAttribute('#jp_audio_0', 'src')
    this.echo(url)
    this.download(url, 'casper.mp3')
  })
})

casper.run(function () {
  this.echo('Done.').exit()
})