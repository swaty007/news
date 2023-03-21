import puppeteer from 'puppeteer-extra'
import pluginStealth from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import { validationService, fixHtmlText, getCurrentPage } from './helpers/helpers'
import { Browser, Page } from 'puppeteer'
import needle from "needle"
import { SocksProxyAgent } from "socks-proxy-agent"

const recaptchaPlugin = RecaptchaPlugin({
  provider: { id: '2captcha', token: 'XXXXXXX' },
  visualFeedback: true,
})
puppeteer.use(pluginStealth())
puppeteer.use(recaptchaPlugin)

// brew services start tor
const torPorts = [
  9050,
  9051,
  9052,
  9053,
  9054,
  9055,
  9056,
  9057,
]

class GoogleTranslate{
  totalRequest: { time: number; requestGoogle: number }
  translatorCache: { [key: string]: string }
  cacheStringLength: number
  proxied: boolean | string
  langMapper: { [key: string]: string }
  defaultText: string[]
  lang: string
  browser!: Browser
  page!: Page

  constructor (lang: Languages = 'ru') {
    this.totalRequest = {
      time: 0,
      requestGoogle: 0,
    }
    this.translatorCache = {}
    this.cacheStringLength = 50
    this.proxied = false
    this.langMapper = {
      zh: 'zh-CN',
      nb: 'no',
    }
    this.defaultText = [
      'Infinitum.tech',
      'dmg.news',
    ]
    if (this.langMapper[lang]) {
      this.lang = this.langMapper[lang]
    } else {
      this.lang = lang
    }
  }

  async init (): Promise<void> {
    const torPort = torPorts.shift()
    let torArgs = ''
    if (torPort) {
      const myAgent = new SocksProxyAgent(`socks5://127.0.0.1:${torPort}`)
      myAgent.timeout = 10000
      try {
        const result = await needle('get', 'https://api.ipify.org/', { agent: myAgent })
        console.log(result.body)
        this.proxied = `socks5://127.0.0.1:${torPort}`
        torArgs = `--proxy-server=socks5://127.0.0.1:${torPort}`
      } catch (e) {
        this.proxied = false
        console.error('error connect proxy', e)
      }
    } else {
      this.proxied = false
    }

    this.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        torArgs,
      ],
      headless: true,
      defaultViewport: {
        width: 980,
        height: 600,
      },
      handleSIGINT: true, // <boolean> Close the browser process on Ctrl-C. Defaults to true.
      handleSIGTERM: true, // <boolean> Close the browser process on SIGTERM. Defaults to true.
      handleSIGHUP: true, // <boolean> Close the browser process on SIGHUP. Defaults to true.
      executablePath: '/opt/homebrew/bin/chromium',
    })
    try {
      // const page = this.page = await browser.newPage()
      const page = this.page = await getCurrentPage(this.browser)
      await page.setViewport({ width: 980, height: 600 })
      // await page.goto(`https://translate.google.ru/#view=home&op=translate&sl=auto&tl=${ this.lang }&`, { waitUntil: 'networkidle0' })
      await page.goto(`https://translate.google.ru/#view=home&sl=auto&tl=${this.lang}&op=translate`, { waitUntil: 'networkidle0' })
      await page.solveRecaptchas()
      const input = await page.$('#source')
      if (input == null) {
        console.log('error find #source')
        // await this.browser.close()
        // await this.init().then(data => {
        //   resolve()
        // })
        // resolve()
      } else {
        // resolve()
      }
    } catch (e) {
      validationService(e)
    }
  }

  getDefaultText (): string {
    return this.defaultText[Math.floor(Math.random() * this.defaultText.length)]
  }

  async translate (...texts: string[]): Promise<string[]> {
    const maxLength = 4500
    // return text.reduce((prev, string) => prev.then(result => this.translateString(string))
    //   .then(stringTranslation => [...prev, stringTranslation]), Promise.resolve([]))
    if(!texts.length) {
      return [this.getDefaultText()]
    }
    const result = []
    for (let text of texts) {
      if (!text) {
        return [this.getDefaultText()]
      }
      text = fixHtmlText(text)
      if (text.length > maxLength) {
        // let ceil = Math.ceil(text.length / maxLength)
        let string = ''

        let step = 0
        while (text.length > step) {
          await this.page.waitForTimeout(200)
          const slice = text.slice(step, maxLength)
          let last_index = slice.lastIndexOf('.')
          last_index = last_index > 0 ? last_index : step + maxLength
          // await new Promise((resolve, reject) => {
          try {
            const data = await this.translateString(text.slice(Math.ceil(step), Math.ceil(last_index)))
            string += data
          } catch (e) {
            console.error('go to restart: BIG DATA ', e)
            await this.page.waitForTimeout(10000)
            step = last_index
            try {
              await this.finish()
              await this.init()
              const data = this.translateString(text.slice(Math.ceil(step), Math.ceil(last_index + maxLength)))
              string += data
            } catch (e) {
              await this.page.screenshot({ path: './parser/photos/big' + Date.now() + '.png', fullPage: true })
              console.error('gg bro BIG')
            }
          }
          // })
          step = last_index
        }
        result.push(string)
      } else {
        await this.page.waitForTimeout(200)
        // await this.page.waitForTimeout(300)
        try {
          const res = await this.translateString(text)
          result.push(res)
        } catch (e) {
          console.error('go to restart: Small DATA')
          await this.page.waitForTimeout(10000)
          try {
            await this.finish()
            await this.init()
            const res = await this.translateString(text)
            result.push(res)
          } catch (e) {
            console.error('gg bro SMALL')
            await this.page.screenshot({ path: './parser/photos/small' + Date.now() + '.png', fullPage: true })
          }
        }
      }
    }
    return result
    // if (result.length <= 1) {
    //   return result[0]
    // } else {
    //   return result
    // }
  }

  async translateString (string: string) {
    if (!string) {
      return this.getDefaultText()
    }
    if (this.translatorCache[string]) {
      // console.log('get translate from cache', string, this.translatorCache[string])
      return this.translatorCache[string]
    }
    this.totalRequest.requestGoogle += 1
    try {
      const page = this.page
      // await page.waitForNavigation({waitUntil: 'networkidle0'});
      await page.waitForTimeout(400)
      // await page.waitForTimeout(1300)
      const input = await page.$('#source') as HTMLInputElement | null
      let html = ''
      if (input) {
        await page.evaluate((el) => el.value = '', input)
        // try {
        //   await page.evaluate((el) => el.value = '', input)
        // } catch (e) {
        // console.log('source ERROR')
        // await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
        // await page.evaluate((el) => el.value = '', input)
        // }
        // await page.type('#source', string, { delay: 0 })
        // await page.waitForTimeout(1500)
        await page.waitForTimeout(1400)
        await page.evaluate((el, string) => el.value = string, input, string)
        await page.waitForResponse(response => response.url().startsWith('https://translate.google.ru/translate_a/single'))
        await page.waitForSelector('.tlid-translation.translation', { visible: true })
        const element = await page.$('.tlid-translation.translation')
        // await page.waitForTimeout(2200)
        await page.waitForTimeout(2000)
        if (!element) {
          throw new Error('Empty element: .tlid-translation.translation')
        }
        html = await page.evaluate(el => el.innerHTML, element)
      } else {
        const textarea = await page.$('textarea')
        if (!textarea) {
          throw new Error('Empty textarea: textarea')
        }
        await page.evaluate((el) => el.value = '', textarea)
        await page.waitForTimeout(800)
        await page.evaluate((el, string) => el.value = string, textarea, string)
        await page.type('textarea', ' ', { delay: 10 })
        try {
          await page.waitForResponse(response =>
            response.url().startsWith('https://translate.google.ru/_/TranslateWebserverUi/') ||
            response.url().startsWith('https://play.google.com/log?format=json&hasfast=true'))
            // response.url().startsWith('https://www.google.ru/log?format=json&hasfast=true')
        } catch (e) {
          console.error('await response', e)
        }
        await page.waitForTimeout(800) //IMPORTANT: FOR CORRECT TRANSLATE
        await page.waitForSelector('.KkbLmb', { visible: true })
        await page.waitForTimeout(500)
        const elements = await page.$$('.ryNqvb')
        await page.waitForTimeout(500)
        for (const element of elements) {
          const text = await page.evaluate(el => el.innerHTML, element)
          // console.log(text, 'MY SUPER TEXT')
          html += `${text} \n`
        }
        if (html === '') {
          const elements = await page.$$('.HwtZe')
          for (const element of elements) {
            const text = await page.evaluate(el => el.innerHTML, element)
            // console.log(text, 'MY SUPER TEXT')
            html += `${text} \n`
          }
          if (html === '') {
            throw new Error('Empty HTML: ' + string)
          }
        }
        // await page.waitForTimeout(2200)
      }

      const result = fixHtmlText(html)
      if (string.length <= this.cacheStringLength) {
        this.translatorCache[string] = result
      }
      return result
    } catch (e: any) {
      console.error('try to restart', e)
      throw new Error(e)
    }
  }

  async finish () {
    console.log(this.lang, ' Google Browser End ', this.totalRequest)
    await this.page.close()
    await this.browser.close()
    await this.browser.disconnect()
    // process.exit()
  }
}

export {
  GoogleTranslate,
}