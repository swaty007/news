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
          console.error(err, 'error Request', data.url)
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
    let post = await this.db.Post.findOne({
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