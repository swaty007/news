import needle from 'needle'
import { performance } from 'perf_hooks'
import { googleTranslate } from './googleTranslate.js'
import { Gazetapl } from './domains/gazetapl.js'
import { validationService } from './helpers/helpers.js'
import db from './models/index.js'

class Parser {
  constructor () {
    this.insertUrl = 'https://news.infinitum.tech/wp-json/parse/v1/insert'
    this.uniqueUrl = 'https://news.infinitum.tech/wp-json/parse/v1/unique'
    this.mainLang = 'pl'
    this.languages = [
      'uk',
      'en',
      'ru',
      'zh',
      // 'pl',

      'da', //da_DK
      // 'nb', // 'no', //nb_NO
    ]
    this.results = []
    this.totalRequest = {
      time: 0,
    }

    this.init()
  }
  async init () {
    this.db = await db
    let waitArray = []
    for(let lang of this.languages) {
      this['google_' + lang] = new googleTranslate(lang)
      waitArray.push(this['google_' + lang].init())
    }
    await Promise.all(waitArray)
    console.log('init google')
    this.startLoop(Gazetapl)
  }
  async startLoop (emitter) {
    this.em = new emitter(this.db).init()
    this.em.on('newPost', async (originalPost) => {
      await this.db.Post.create({
        url: originalPost.url,
        status: 1,
        html: JSON.stringify(originalPost),
      })
      let translatedPostData = await this.setPostLanguage(originalPost)
      // console.log('translatedPostData: ', translatedPostData)

      await this.savePost(translatedPostData).then(async () => {
        await this.db.Post.update({ status: 5 }, {
          where: {
            url: originalPost.url,
          },
        })
      })
    })
  }
  async setPostLanguage (originalPost) {
    return await new Promise(  async (resolve, reject) => {
      let translates = {
        [originalPost.mainLang]: originalPost,
      }
      for (let lang of this.languages) {
        if (lang === originalPost.mainLang) {
          continue
        }
        await this.translatePost(originalPost, lang).then(async (data) => { // просто не нуждна такая скорость
          translates[lang] = data
        }).catch(err => {
          validationService(err)
          console.log('error post pars:', originalPost)
          reject('setPostLanguage')
        })
      }
      resolve(translates)
    })
  }
  async translatePost (originalPost, lang) {
    return await new Promise(  async (resolve, reject) => {
      try {
        let data = {
          post_title: await this['google_' + lang].translate(originalPost.post_title),
          post_excerpt: await this['google_' + lang].translate(originalPost.post_excerpt),
          post_content: await this['google_' + lang].translate(originalPost.post_content),
          // post_date_gmt: originalPost.post_date_gmt,
          image: originalPost.image,
          tags: await this['google_' + lang].translate(...originalPost.tags),
          categories: await this['google_' + lang].translate(...originalPost.categories),
        }
        resolve(data)
      } catch (e) {
        console.log('go miss post and try next, on translatePost')
        reject()
      }
    })
  }
  async savePost (translates) {
    return new Promise((resolve, reject) => {
      needle.post(this.insertUrl, translates, { json : true,  headers: { 'lang': this.mainLang } }, (err, res) => {
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
}

new Parser()
// module.exports = {
//   Parser
// };