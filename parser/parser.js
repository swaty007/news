import needle from 'needle'
import { googleTranslate } from './googleTranslate.js'
import { Gazetapl } from './domains/gazetapl.js'
import { De24live } from './domains/de24live.js'
import { validationService } from './helpers/helpers.js'
import db from './models/index.js'

class Parser {
  constructor () {
    this.insertUrl = 'https://news.infinitum.tech/wp-json/parse/v1/insert'
    // this.insertUrl = 'https://dmg.news/wp-json/parse/v1/insert'
    // this.uniqueUrl = 'https://news.infinitum.tech/wp-json/parse/v1/unique'
    this.languages = [
      'en', //must be first
      'uk',
      'ru',
      'zh',

      'de',
      'pl',

      'da', //da_DK
      'nb', // 'no', //nb_NO
    ]
    this.results = []
    this.totalRequest = {
      time: 0,
    }
    // this.savePost('', 'ru')
    // return
    this.init()
  }

  async init () {
    this.db = await db
    let waitArray = []
    for (let lang of this.languages) {
      this['google_' + lang] = new googleTranslate(lang)
      waitArray.push(this['google_' + lang].init())
    }
    await Promise.all(waitArray)
    console.log('init google')

    this.startLoop()
  }

  async startLoop () {
    this.insertUrl = 'https://dmg.news/wp-json/parse/v1/insert'
    await this.initEmitter(De24live)
    console.log('Finish De24live go Gazetapl')
    this.insertUrl = 'https://news.infinitum.tech/wp-json/parse/v1/insert'
    await this.initEmitter(Gazetapl)
    console.log('Finish Gazetapl go startLoop')

    setTimeout(() => {
      this.startLoop()
    }, 30000)
  }

  async initEmitter (emitter) {
    await new emitter(this.db).init(this)
    // this.em = new emitter(this.db).init(this)
    // this.em.on('newPost', async (originalPost) => {
    //   console.log('onNewPost')
      // await this.newPost(originalPost)
    // })
  }

  async newPost (originalPost) {
    try {
      await this.db.Post.create({
        url: originalPost.url,
        status: 1,
        html: JSON.stringify(originalPost),
      })
    } catch (e) {
      console.log('Database Error Create: ', e.message, e.errors, originalPost.url)
    }
    let translatedPostData = await this.setPostLanguage(originalPost)

    await this.savePost(translatedPostData, originalPost.mainLang)
    await this.db.Post.update({ status: 5 }, {
      where: {
        url: originalPost.url,
      },
    })
  }

  async setPostLanguage (originalPost) {
    let translates = {
      [originalPost.mainLang]: originalPost,
    }
    for (let lang of this.languages) {
      if (lang === originalPost.mainLang) {
        continue
      }
      let postToTranslate = originalPost
      if (translates['en']) {
        postToTranslate = translates['en']
      }
      try {
        translates[lang] = await this.translatePost(postToTranslate, lang)
      } catch (e) {
        validationService(err)
        console.log('error post pars:', postToTranslate)
        throw new Error('setPostLanguage')
      }
    }
    return translates
  }

  async translatePost (originalPost, lang) {
    try {
      let data = {
        post_title: await this['google_' + lang].translate(originalPost.post_title),
        post_excerpt: await this['google_' + lang].translate(originalPost.post_excerpt),
        post_content: await this['google_' + lang].translate(originalPost.post_content),
        // post_date_gmt: originalPost.post_date_gmt,
        image: originalPost.image,
      }
      let tags = await this['google_' + lang].translate(...originalPost.tags)
      if (typeof tags === 'object') {
        data.tags = tags
      } else {
        data.tags = [tags]
      }
      let categories = await this['google_' + lang].translate(...originalPost.categories)
      if (typeof categories === 'object') {
        data.categories = categories
      } else {
        data.categories = [categories]
      }
      if (!data.tags) {
        data.tags = []
      }
      return data
    } catch (e) {
      console.error('go miss post and try next, on translatePost', e)
      throw new Error()
    }
  }

  async savePost (translates, mainLang) {
    return new Promise((resolve, reject) => {
      needle.post(this.insertUrl, translates, { json: true, headers: { 'lang': mainLang } }, (err, res) => {
        if (err) {
          console.error(err, 'error Request Save', this.insertUrl)
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