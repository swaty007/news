import * as cheerio from 'cheerio'
import needle from 'needle'
import events from 'events'
import { Parser } from '../parser'

abstract class abstractDomain {
  parser!: Parser
  db: { [key: string]: any }
  events: events.EventEmitter

  constructor (db: { [key: string]: any }) {
    this.db = db
    this.events = new events.EventEmitter()
  }
  async init (cbFunction: Parser): Promise<events.EventEmitter> {
    this.parser = cbFunction
    await this.startParse()
    return this.events
  }

  startParse () {
        throw new Error('Method not implemented.')
    }
  async requestGetPage (data: { url: string }): Promise<cheerio.CheerioAPI> {
    return new Promise((resolve, reject) => {
      needle.get(data.url, {},(err, res) => { // { agent: myAgent },
        // this.totalRequest.google += 1
        if (err) {
          console.error(err, 'error Request', data.url)
          setTimeout(() => {
            reject()
          }, 500)
          return
        }
        setTimeout(() => {
          if (res.body) {
            resolve(this.parseHtml(res.body))
          } else {
            console.error('res.body', res.body)
            reject()
          }
        }, 500)
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