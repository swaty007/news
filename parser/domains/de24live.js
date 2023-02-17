import events from 'events'
import { abstractDomain } from './abstractDomain.js'
import { validationService, fixHtmlText } from '../helpers/helpers.js'


class De24live extends abstractDomain {
  constructor (db) {
    super(db)
    this.events = new events.EventEmitter()
    this.mainLang = 'de'
    this.parseEntries = [
      {
        parseUrl: 'https://www.de24live.de',
        category: ['Nachricht'],
      },
      {
        parseUrl: 'https://www.oe24.at/',
        category: ['Nachricht'],
      },
    ]
  }
  async init (cbFunction) {
    this.parser = cbFunction
    await this.startParse()
    return this.events
  }
  async startParse () {
    for (let entries of this.parseEntries) {
      await this.searchArticles(entries)
    }
    console.log('Finish Parse De24live!')
    // setTimeout(() => {
    //   this.startParse()
    // }, 30000)
  }
  async searchArticles (entries) {
    let $ = await this.requestGetPage({ url: entries.parseUrl })
    let urls = []
    $('#wrap section.banner .xlBox a.story').each( (index, el) => {
      urls.push($(el).attr('href'))
    })
    for (let page of urls) {
      if (await this.uniqueCheck(page)) {
        // console.log('uniqueCheck failed:', page)
        continue
      }
      try {
        let $ = await this.requestGetPage({ url: page })
        let post_title = $('.articleTitelBox h1').text().trim()
        if(!post_title) {
          // post_title = $('.article .article__sidebar h1.article__title').text().trim()
        }
        let post_excerpt = $('head meta[name="description"]').attr('content')
        if (!post_excerpt) {
          post_excerpt = $('head meta[name="Description"]').attr('content')
        }
        post_excerpt = post_excerpt ? post_excerpt.trim() : post_excerpt
        let post_content = $('div.articleTextBox').html()
        post_content = post_content ? fixHtmlText(post_content.trim()) : ''
        if (!post_title || !post_content) {
          console.error('Wrong Post Data: ', page)
          await this.db.Post.create({
            url: page,
            status: -1,
          })
          continue
        }
        let post_date_gmt = 'no date'
        let image = {
          guid: $('head meta[property="og:image"]').attr('content'),
        }
        let tags = []
        // $('.bottom_section .tags ul.tags_list li.tags_item a').each((tI, tEl) => {
        //   tags.push($(tEl).text().trim())
        // })
        // console.log(post_content)

        let categories = []
        let urlParse = new URL(page)
        let catFromUrl = urlParse.pathname.split('/')
        if (catFromUrl[1]) {
          categories.push(catFromUrl[1])
        }
        if (catFromUrl[2] && catFromUrl[4]) {
          categories.push(catFromUrl[2])
        }
        if (!categories.length) {
          categories.push(entries.category)
        }
        // console.log('categories2', categories)
        let result = {
          url: page,
          mainLang: this.mainLang,
          post_title,
          post_excerpt,
          post_content,
          // post_date_gmt,
          image,
          tags,
          categories: [...new Set(categories)],
        }
        // this.events.emit('newPost', result)
        await this.parser.newPost(result)
      } catch (e) {
        console.error('searchArticles', e)
      }
    }
    return true
  }
}

export {
  De24live,
}