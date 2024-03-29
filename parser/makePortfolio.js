// import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// import { validationService, fixHtmlText } from './helpers/helpers.js'
import puppeteer from 'puppeteer-extra'
import pluginStealth from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import mysql from 'mysql'
import { portfolioBD } from '../.env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const recaptchaPlugin = RecaptchaPlugin({
  provider: { id: '2captcha', token: 'XXXXXXX' },
  visualFeedback: true,
})
puppeteer.use(pluginStealth())
puppeteer.use(recaptchaPlugin)

let connection = mysql.createConnection(portfolioBD)

class makePorfolio {
  constructor () {
    this.sites = [
      {
        name: 'Industrial Engineering',
        url: 'http://id-master.demo.gns-it.com/',
      },
      {
        name: 'car.ua',
        url: 'https://car.ua/',
      },
      {
        name: 'Smart Cloud Connect',
        url: 'https://smartcloudconnect.io/',
      },
    {
      name: 'Mobzoid',
        url: 'http://mobzoid.infinitum.tech/',
    },
    {
      name: 'Octopus',
        url: 'https://octopuscs.com/',
    },
    {
      name: 'Green Aura',
        url: 'https://green-aura.com.ua/',
    },
      {
      name: 'Sensco Logistic',
        url: 'http://logistic.infinitum.tech/',
    },
    {
      name: 'Miff No',
        url: 'https://miff.no/',
    },
    {
      name: 'Crystal Group',
        url: 'https://crystalgroup.ua/',
    },
      {
        name: 'Ctr Center',
        url: 'https://ctrcenter.org/',
      },
      {
        name: 'Itea Ua',
        url: 'https://itea.ua/',
      },
      {
        name: 'Itea Online',
        url: 'https://itea-web-master.demo.gns-it.com',
        // url: 'http://itea-website/',
      },
      {
        name: 'Legal Consult',
        url: 'https://legal-consult.com.ua/',
      },
      {
        name: 'Chernobyl UA',
        url: 'https://chernobyl.ua/',
      },
      {
        name: 'Swift Delivery',
        url: 'https://swiftdeliverydc.com/',
      },
      {
        name: 'Witch Bar',
        url: 'https://www.witchbar.com.ua/',
      },
      {
        name: 'Gios',
        url: 'https://gioschool.com/',
      },
      {
        name: 'Jungo',
        url: 'https://jungo.dev/',
      },
      {
        name: 'The Viking Planet',
        url: 'https://thevikingplanet.com/',
      },
      {
        name: 'Liquidator Pro',
        url: 'https://liquidatorpro.com.ua/',
      },
      {
        name: 'Zoom Store',
        url: 'https://zoomstore.com.ua/',
      },
      {
        name: 'Localtrade',
        url: 'https://localtrade.cc/',
      },
      {
        name: 'Yurchenko',
        url: 'https://yurchenko.ua/',
      },
      {
        name: 'Клиника Таргет',
        url: 'https://www.clinic-target.com/',
      },
      {
        name: 'Zoom Store',
        url: 'https://zoomstore.com.ua/',
      },
      // {
      //   name: '',
      //   url: '',
      // },
    ]
  }

  async init () {
      await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        handleSIGINT: true, // <boolean> Close the browser process on Ctrl-C. Defaults to true.
        handleSIGTERM: true, // <boolean> Close the browser process on SIGTERM. Defaults to true.
        handleSIGHUP: true, // <boolean> Close the browser process on SIGHUP. Defaults to true.
        executablePath: '/opt/homebrew/bin/chromium',
      }).then(async browser => {
        this.browserComp = browser
          const page = this.pageComp = await browser.newPage()
          await page.setViewport({ width: 1280, height: 1024 })
      })
      await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        handleSIGINT: true, // <boolean> Close the browser process on Ctrl-C. Defaults to true.
        handleSIGTERM: true, // <boolean> Close the browser process on SIGTERM. Defaults to true.
        handleSIGHUP: true, // <boolean> Close the browser process on SIGHUP. Defaults to true.
        executablePath: '/opt/homebrew/bin/chromium',
      }).then(async browser => {
        this.browserDesktop = browser
        const page = this.pageDesktop = await browser.newPage()
        await page.setViewport({ width: 1024, height: 800 })
        // await page.setViewport({ width: 1024, height: 1366 })
      })
      await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        handleSIGINT: true, // <boolean> Close the browser process on Ctrl-C. Defaults to true.
        handleSIGTERM: true, // <boolean> Close the browser process on SIGTERM. Defaults to true.
        handleSIGHUP: true, // <boolean> Close the browser process on SIGHUP. Defaults to true.
        executablePath: '/opt/homebrew/bin/chromium',
      }).then(async browser => {
        this.browserMobile = browser
        const page = this.pageMobile = await browser.newPage()
        await page.setViewport({ width: 375, height: 667 })
      })
    for (let index = 0; index < this.sites.length; index++) {
      // console.log(this.sites[index].url)
      console.log(index)
      await this.makePhoto(this.sites[index])
    }
    console.log('finish')
    await this.finish()
  }

  async makePhoto (data) {
console.log(data)
    return new Promise(async (resolve, reject) => {
      console.log(1)
      await this.pageComp.goto(`${data.url}`, { waitUntil: 'load' })
      console.log(2)
      // await this.pageComp.waitForNavigation()
      await this.pageDesktop.goto(`${data.url}`, { waitUntil: 'load' })
      // await this.pageDesktop.waitForNavigation()
      await this.pageMobile.goto(`${data.url}`,  { waitUntil: 'load' })
      // await this.pageMobile.waitForNavigation()
      let dir = __dirname + `/img/sites/${data.name.toLowerCase().replace(' ', '')}`
      try {
        fs.mkdirSync(dir)
      } catch (e) {

      }

      await connection.query(`REPLACE INTO swaty_infinitum.projects SET ?`,
        {
          name: data.name,
          link: data.url,
          design: 0,
          img: data.name.toLowerCase().replace(' ', ''),
        },
        (mysql_save_error, results, fields) => {
          if (mysql_save_error) {
            console.log(mysql_save_error,'mysql_save_error')
            // throw mysql_save_error;
          }
        })

      await this.pageComp.screenshot({ path: "./parser/img/sites/" + data.name.toLowerCase().replace(' ', '') + "/comp.png", fullPage: false })
      await this.pageDesktop.screenshot({ path: "./parser/img/sites/" + data.name.toLowerCase().replace(' ', '') + "/desktop.png", fullPage: false })
      await this.pageMobile.screenshot({ path: "./parser/img/sites/" + data.name.toLowerCase().replace(' ', '') + "/mobile.png", fullPage: false })
      resolve()
    })
  }


  async finish () {
    await this.browserComp.close()
    await this.browserDesktop.close()
    await this.browserMobile.close()
    process.exit()
  }
}

new makePorfolio().init()