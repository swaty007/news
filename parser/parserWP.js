import needle from 'needle'
import { googleTranslate } from './googleTranslate.js'
import { performance } from 'perf_hooks'
import { validationService, fixHtmlText } from './helpers/helpers.js'
import { miffDK, miffNO } from '../.env.js'
import mysql from 'mysql'

  let connection = mysql.createConnection(miffDK),
  mainLang = 'da'
  // connection = mysql.createConnection(miffNO),
  // mainLang = 'nb'

class parserWP {
  constructor () {
    this.limit = 30
    this.offset = 0
    this.lastDate = new Date('2021-06-04T08:47:04.000Z') //DK
    // this.firstDate = new Date('2020-08-21T07:38:59.000Z') //DK
    // this.firstDate = new Date('2020-08-13T13:47:04.000Z') //DK
    this.firstDate = new Date('2007-09-15 12:11:07.000Z') //DK
    this.insertUrl = 'https://news.infinitum.tech/wp-json/parse/v1/insert'
    this.uniqueUrl = 'https://news.infinitum.tech/wp-json/parse/v1/unique'
    this.total = null
    this.languages = [
      'ru',
      'en',
      'uk',
      'zh',
    ]
    this.domainsParsed = 0
    this.totalRequest = {
      time: performance.now(), //1000
      posts: 0,
    }
    console.time("Posts Parser")
    // setTimeout(() => {
    //   this.totalRequest.time = performance.now() - this.totalRequest.time
    //   console.timeEnd("Posts Parser")
    //   console.log(this.totalRequest)
    // }, 5000)

    this.init()
  }
  parseNewDomain () {
    if (this.domainsParsed === 1) {
      this.totalRequest.time = performance.now() - this.totalRequest.time
      console.timeEnd("Posts Parser")
      console.log(this.totalRequest)
      console.log(this.offset, ' offset, ', this.total, ' total')
      this.googleru.finish()
      this.googleuk.finish()
      this.googleen.finish()
      this.googlezh.finish()
      return
    }
    this.domainsParsed++

    this.offset = 0
    this.total = null
    connection = mysql.createConnection(miffNO),
      mainLang = 'nb'
    this.lastDate = new Date('2021-07-21T10:40:33.000Z') //NO
    this.firstDate = new Date('2021-07-21 12:11:07.000Z') //NO

    connection.query(`SELECT count(*) as total FROM wp_posts WHERE post_type='post' AND post_status='publish'`,  (err, result) => {
      console.log(result[0].total)
      this.total = result[0].total
    })
    this.loop()
  }
  async init () {
    this.googleru = new googleTranslate()
    this.googleuk = new googleTranslate('uk')
    this.googleen = new googleTranslate('en')
    this.googlezh = new googleTranslate('zh-CN')
   await Promise.all([
       this.googleru.init(),
       this.googleuk.init(),
       this.googleen.init(),
       this.googlezh.init(),
    ])
    console.log('init google')

    connection.query(`SELECT count(*) as total FROM wp_posts WHERE post_type='post' AND post_status='publish'`,  (err, result) => {
      console.log(result[0].total)
      this.total = result[0].total
    })
    this.loop()
  }
  async loop () {
    connection.query(`SELECT * FROM wp_posts LEFT JOIN wp_postmeta ON wp_postmeta.post_id = wp_posts.ID AND wp_postmeta.meta_key = '_thumbnail_id'
 WHERE wp_posts.post_type='post' AND wp_posts.post_status='publish' ORDER BY wp_posts.post_date_gmt DESC LIMIT ? OFFSET ?`,
      [this.limit, this.offset],
      async (error, results, fields) => {
        if (error) {
          console.log(error, 'mysql_save_error')
          validationService(error)
        }
        for (let item of results) {
          if (item.post_date_gmt > this.lastDate || item.post_date_gmt < this.firstDate) {
            console.log('go parse ID: ', item.ID, ' date dmt = ', item.post_date_gmt, String(item.post_date_gmt))
            await this.setPostLanguage(item)
              .catch(e => {
                console.log('go fail ID: ', item.ID, '  ERROR GO NEXT')
              })
            this.totalRequest.posts += 1
          } else {
            console.log('skip ID: ', item.ID, ' date dmt = ', item.post_date_gmt, String(item.post_date_gmt))
          }
        }

        if (this.total >= this.offset) {
          this.totalRequest.time = performance.now() - this.totalRequest.time
          this.offset += this.limit
          console.log('Loop Done', this.totalRequest)
          console.log(this.offset, ' offset, ', this.total, ' total')
          this.loop()
        } else {
          this.totalRequest.time = performance.now() - this.totalRequest.time
          console.timeEnd("Posts Parser")
          console.log(this.totalRequest)
          console.log(this.offset, ' offset, ', this.total, ' total')
          // this.parseNewDomain()
          await Promise.all([
            this.googleru.finish(),
            this.googleuk.finish(),
            this.googleen.finish(),
          ])
        }
      })
  }
  async setPostLanguage (item) {
    return await new Promise(  (resolve, reject) => {
      Promise.all([
        this.getPostMeta(item),
        this.getPostTerms(item),
      ]).then(async (data) => {
        // console.log(data[0])
        // console.log(data[1])
        // console.log({ ...data[0], ...data[1] })
        let originalPost = { ...data[0], ...data[1] }
        // console.log(item)
        // console.log(originalPost)
        if (await this.uniqueTest(originalPost)) {
          console.log('Not original post name or img', originalPost.post_title, originalPost.image)
          reject('Not original post name or img')
          return
        }
        let translates = {
          [mainLang]: originalPost,
        }
        for (let lang of this.languages) {
            await this.translatePost(originalPost, lang).then(async (data) => { // просто не нуждна такая скорость
              translates[lang] = data
              if (Object.keys(translates).length === this.languages.length + 1) {
                let result = false
                while (result != true) {
                  result = await this.savePost(translates)
                }
                resolve()
              }
            }).catch(err => {
              validationService(err)
              console.log('error post pars ID:', item.ID)
              reject('setPostLanguage')
            })
        }
      })
    })
  }
  async savePost (translates) {
    return new Promise((resolve, reject) => {
      needle.post(this.insertUrl, translates, { json : true,  headers: { 'lang': mainLang } }, (err, res) => {
        if (err) {
          console.log(err, 'error Request Save', this.insertUrl)
          validationService(err)
          resolve(false)
          return
        }
        console.log(res.body, 'insertUrl res.body')
        if (res.body) {
          resolve(true)
        }
      })
    })
  }
  async translatePost (originalPost, lang) {
    return await new Promise(  async (resolve, reject) => {
      try {
        let data = {
          post_title: await this['google' + lang].translate(originalPost.post_title),
          post_excerpt: await this['google' + lang].translate(originalPost.post_excerpt),
          post_content: await this['google' + lang].translate(originalPost.post_content),
          post_date_gmt: originalPost.post_date_gmt,
          image: originalPost.image,
          tags: await this['google' + lang].translate(...originalPost.tags),
          categories: await this['google' + lang].translate(...originalPost.categories),
        }
        resolve(data)
      } catch (e) {
        console.log('go miss post and try next, on translatePost')
        reject()
      }
    })
  }
  async uniqueTest (originalPost) {
    return await new Promise(  (resolve, reject) => {
      needle.post(this.uniqueUrl, originalPost, { json : true }, (err, res) => {
        if (err) {
          console.log(err, 'error Request unique', this.uniqueUrl)
          validationService(err)
          return
        }
        console.log(res.body, 'uniqueTest')
        resolve(res.body)
      })
    })
  }
  async getPostMeta (item) {
    return await new Promise(  (resolve, reject) => {
      connection.query(`SELECT * FROM wp_posts WHERE ID = ?`, [item.meta_value], async (mysql_error, results, fields) => {
        // console.log(results)
        if (mysql_error) {
          validationService(mysql_error)
        }
        let data = {
          post_title: fixHtmlText(item.post_title),
          post_excerpt: fixHtmlText(item.post_excerpt),
          post_content: fixHtmlText(item.post_content),
          post_date_gmt: item.post_date_gmt,
          image: {
            guid: results.length ? results[0].guid : '',
            post_title: results.length ? results[0].post_title : '',
          },
        }
        resolve(data)
      })
    })
  }
  async getPostTerms (item) {
    return await new Promise(  (resolve, reject) => {
      let tags = []
      let categories = []
      connection.query(`SELECT * FROM wp_term_relationships LEFT JOIN wp_term_taxonomy ON wp_term_taxonomy.term_taxonomy_id = wp_term_relationships.term_taxonomy_id LEFT JOIN wp_terms ON wp_term_taxonomy.term_id = wp_terms.term_id  WHERE object_id = ? `, [item.ID], async (mysql_error, results, fields) => {
        // console.log(results)
        if (mysql_error) {
          validationService(mysql_error)
        }
        results.forEach((term) => {
          switch (term.taxonomy) {
            case 'post_tag':
              tags.push(term.name)
              break
            case 'category':
              categories.push(term.name)
              break
          }
        })
        resolve({ tags, categories })
      })
    })
  }
}
new parserWP()
