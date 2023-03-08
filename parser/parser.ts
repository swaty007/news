import needle from 'needle'
import { GoogleTranslate } from './googleTranslate'
import { Gazetapl } from './domains/gazetapl'
import { De24live } from './domains/de24live'
import { Healthline } from './domains/healthline'
import { validationService } from './helpers/helpers'
import db from './models/index.js'

class Parser implements ParserInstance{
  insertUrl: string
  languages: Languages[]
  totalRequest: { time: number }
  db: { [key: string]: any }
  translates: Map<Languages, GoogleTranslate>
  
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
    this.totalRequest = {
      time: 0,
    }
    // this.savePost('', 'ru')
    // return
    this.translates = new Map()
    for (const lang of this.languages) {
      this.translates.set(lang, new GoogleTranslate(lang))
    }
    this.db = db
    this.init()
  }

  async init () {
    this.db = await this.db
    const waitArray = []
    for (const lang of this.languages) {
      const translator = this.translates.get(lang)
      if (translator) {
        waitArray.push(translator.init())
      }
    }
    await Promise.all(waitArray)
    console.log('init google')

    this.startLoop()
  }

  async startLoop () {
    await this.initEmitter(Healthline)
    console.log('finish Healthline go De24live')
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

  async initEmitter (emitter: Class<Domain>) {
    await new emitter(this.db).init(this)
    // this.em = new emitter(this.db).init(this)
    // this.em.on('newPost', async (originalPost) => {
    //   console.log('onNewPost')
      // await this.newPost(originalPost)
    // })
  }

  async newPost (originalPost: localPost) {
    const post = await this.db.Post.findOne({
      where: {
        name: originalPost.post_title,
      },
    })
    if (post && post.status !== 1) {
      console.log('unique post name', originalPost.url, post.url, post.status)
      return
    }
    try {
      await this.db.Post.create({
        url: originalPost.url,
        name: originalPost.post_title,
        status: 1,
        html: JSON.stringify(originalPost),
      })
    } catch (e: any) {
      console.log('Database Error Create: ', e.message, e.errors, originalPost.url)
    }
    const translatedPostData = await this.setPostLanguage(originalPost)

    await this.savePost(translatedPostData, originalPost.mainLang)
    await this.db.Post.update({ status: 5 }, {
      where: {
        url: originalPost.url,
      },
    })
  }

  async newPostGreen (originalPost: localPost) {
    const post = await this.db.Post.findOne({
      where: {
        name: originalPost.post_title,
      },
    })
    if (post && post.status !== 1) {
      console.log('unique post name', originalPost.url, post.url, post.status)
      return
    }
    try {
      await this.db.Post.create({
        url: originalPost.url,
        name: originalPost.post_title,
        status: 1,
        html: JSON.stringify(originalPost),
      })
    } catch (e: any) {
      console.log('Database Error Create: ', e.message, e.errors, originalPost.url)
    }
    const translatedPostData = await this.setPostLanguage(originalPost)
    this.insertUrl = 'https://green-aura.com.ua/wp-json/parse/v1/insert'
    const greenPost = {
      'en': translatedPostData.en,
      'uk': translatedPostData.uk,
      'ru': translatedPostData.ru,
    }
    await this.savePost(greenPost, originalPost.mainLang)
    const otherPost = {
      'en': translatedPostData.en,
      'zh': translatedPostData.zh,
      'de': translatedPostData.de,
      'pl': translatedPostData.pl,
      'da': translatedPostData.da,
      'nb': translatedPostData.nb,
    }
    if (Math.random() > 0.5) {
      this.insertUrl = 'https://dmg.news/wp-json/parse/v1/insert'
    } else {
      this.insertUrl = 'https://news.infinitum.tech/wp-json/parse/v1/insert'
    }

    await this.savePost(otherPost, originalPost.mainLang)
    await this.db.Post.update({ status: 5 }, {
      where: {
        url: originalPost.url,
      },
    })
  }

  async setPostLanguage (originalPost: localPost): Promise<{ [key in Languages]?: RestAPIPost }> {
    const { mainLang, url, ...post } = originalPost
    const translates = {
      [mainLang]: post,
    }
    for (const lang of this.languages) {
      if (lang === mainLang) {
        continue
      }
      let postToTranslate = post
      // translates['ens'] = post
      if (translates['en']) {
        postToTranslate = translates['en']
      }
      // console.log(postToTranslate, 'postToTranslate')
      try {
        translates[lang] = await this.translatePost(postToTranslate, lang)
      } catch (e) {
        validationService(e)
        console.log('error post pars:', postToTranslate)
        throw new Error('setPostLanguage')
      }
    }
    return translates
  }

  async translatePost (originalPost: RestAPIPost, lang: Languages): Promise<RestAPIPost> {
    try {
      const translator = this.translates.get(lang)
      if (!translator) {
        throw new Error('Didnt find this.translates.get(lang)')
      }

      const data: RestAPIPost = {
        post_title: (await translator.translate(originalPost.post_title)).join(),
        post_excerpt: (await translator.translate(originalPost.post_excerpt)).join(),
        post_content: (await translator.translate(originalPost.post_content)).join(),
        // post_date_gmt: originalPost.post_date_gmt,
        image: originalPost.image,
        tags: await translator.translate(...originalPost.tags),
        categories: await translator.translate(...originalPost.categories),
      }
      return data
    } catch (e) {
      console.error('go miss post and try next, on translatePost', e)
      throw new Error()
    }
  }

  async savePost (translates: { [key in Languages]?: RestAPIPost }, mainLang: Languages): Promise<boolean> {
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
export {
  Parser,
}
// module.exports = {
//   Parser
// };