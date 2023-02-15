import events from 'events'
import { abstractDomain } from './abstractDomain.js'
import { validationService, fixHtmlText } from '../helpers/helpers.js'


class Gazetapl extends abstractDomain {
  constructor (db) {
    super(db)
    this.events = new events.EventEmitter()
    this.mainLang = 'pl'
    this.parseEntries = [
      {
        parseUrl: 'https://wiadomosci.gazeta.pl/wojna-w-ukrainie',
        category: ['wojna w ukrainie'],
      },
      {
        parseUrl: 'https://wiadomosci.gazeta.pl/spoleczenstwo',
        category: ['Społeczeństwo'],
      },
      {
        parseUrl: 'https://wiadomosci.gazeta.pl/wiadomosci/0,114881.html',
        category: ['Świat'],
      },
      {
        parseUrl: 'https://wiadomosci.gazeta.pl/wiadomosci/0,173952.html',
        category: ['Koronawirus'],
      },
      {
        parseUrl: 'https://wiadomosci.gazeta.pl/wiadomosci/0,156046.html',
        category: ['Edukacja'],
      },
    ]
    // this.parseUrl = 'https://fakty.tvn24.pl/fakty-o-swiecie,61'
  }
  init (cbFunction) {
    this.parser = cbFunction
    this.startParse()
    return this.events
  }
  async startParse () {
    for (let entries of this.parseEntries) {
      await this.searchArticles(entries)
    }
    console.log('%c Finish Parse and restart parse! ', 'background: #fff; color: green;font-size: 55px')
    this.startParse()
  }
  async searchArticles (entries) {
    return new Promise(async (resolve, reject) => {
      let $ = await this.requestGetPage({ url: entries.parseUrl })
      let urls = []
      $('.content_wrap .main_content ul.list_tiles>li.entry>a').each( (index, el) => {
        urls.push($(el).attr('href'))
      })
      for (let page of urls) {
        if (await this.uniqueCheck(page)) {
          console.log('uniqueCheck failed:', page)
          continue
        }
        try {
          let $ = await this.requestGetPage({ url: page })
          let post_title = $('#article_wrapper #article_title').text().trim()
          if(!post_title) {
            post_title = $('.article .article__sidebar h1.article__title').text().trim()
          }
          let post_excerpt = $('head meta[name="Description"]').attr('content')
          post_excerpt = post_excerpt ? post_excerpt.trim() : post_excerpt
          let post_content = $('section.art_content').html()
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
          $('.bottom_section .tags ul.tags_list li.tags_item a').each((tI, tEl) => {
            tags.push($(tEl).text().trim())
          })
          // console.log(post_content)

          let categories = entries.category
          let result = {
            url: page,
            mainLang: this.mainLang,
            post_title,
            post_excerpt,
            post_content,
            // post_date_gmt,
            image,
            tags,
            categories,
          }
          // this.events.emit('newPost', result)
          await this.parser.newPost(result)
        } catch (e) {
          console.error('searchArticles', e)
        }
      }
      resolve(true)
    })
  }
}

export {
  Gazetapl,
}