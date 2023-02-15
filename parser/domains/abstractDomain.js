import * as cheerio from 'cheerio'
import needle from 'needle'

class abstractDomain {
  constructor (db) {
    this.db = db
  }
  async requestGetPage (data) {
    return new Promise((resolve, reject) => {
      needle.get(data.url, {},(err, res) => { // { agent: myAgent },
        // this.totalRequest.google += 1
        if (err) {
          console.log(err, 'error Request', data.url)
          return
        }
        resolve(this.parseHtml(res.body))
      })
    })
  }
  parseHtml (html) {
    // console.log(html)
    let $ = cheerio.load(html)
    return $
  }
  async uniqueCheck (url) {
    return await this.db.Post.findOne({
      where: {
        url: url,
      },
    })
  }
}

export {
  abstractDomain,
}