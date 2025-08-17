import * as cheerio from 'cheerio'
import needle from 'needle'
import events from 'events'
import { Parser } from '../parser'
import { SocksProxyAgent } from "socks-proxy-agent"

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

abstract class abstractDomain {
  parser!: Parser
  db: { [key: string]: any }
  events: events.EventEmitter
  proxies: SocksProxyAgent[]
  currentProxy: number
  proxyInited: boolean
  requestTimeout: number

  constructor (db: { [key: string]: any }) {
    this.db = db
    this.events = new events.EventEmitter()
    this.requestTimeout = 500
    this.proxies = []
    this.currentProxy = 0
    this.proxyInited = false
  }
  async init (cbFunction: Parser): Promise<events.EventEmitter> {
    this.parser = cbFunction
    await this.initProxy()
    await this.startParse()
    return this.events
  }

  async initProxy (): Promise<void> {
    if (this.proxyInited) return
    //initProxy
    for (const torPort of torPorts) {
      if (torPort) {
        try {
          const myAgent = new SocksProxyAgent(`socks5://127.0.0.1:${torPort}`)
          myAgent.timeout = 10000
          const result = await needle('get', 'https://api.ipify.org/', { agent: myAgent })
          console.log('result.body domain proxy', result.body)
          this.proxies.push(myAgent)
        } catch (e) {
          console.error('error connect proxy domains', e)
        }
      }
    }
    this.proxyInited = true
  }

  startParse () {
        throw new Error('Method not implemented.')
    }
  async requestGetPage (data: { url: string }): Promise<cheerio.CheerioAPI> {
    let myAgent: undefined | SocksProxyAgent = undefined
    if (!this.proxies[this.currentProxy]) {
      this.currentProxy = -1
    } else {
      myAgent = this.proxies[this.currentProxy]
    }
    this.currentProxy++
    return new Promise((resolve, reject) => {
      // console.log('request Page: ', data.url, myAgent)
      needle.get(data.url, {
        agent: myAgent,
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        response_timeout: 10000,
        read_timeout: 10000,
        open_timeout: 10000,
      },(err, res) => {
        // console.log('request Page End: ', data.url)
        // this.totalRequest.google += 1
        if (err) {
          console.error('error Request', err, data.url)
          setTimeout(() => {
            reject()
          }, this.requestTimeout)
          return
        }
        setTimeout(() => {
          if (res.body) {
            resolve(this.parseHtml(res.body))
          } else {
            console.error('res.body', res.body)
            reject()
          }
        }, this.requestTimeout)
      })
    })
  }
  parseHtml (html: string): cheerio.CheerioAPI {
    // console.log(html)
    const $ = cheerio.load(html)
    return $
  }
  async uniqueCheck (url: string) {
    const post = await this.db.Post.findOne({
      where: {
        url: url,
      },
    })
    if (post && post.status === 1) {
      return false
    }
    return post
  }
}

export {
  abstractDomain,
}