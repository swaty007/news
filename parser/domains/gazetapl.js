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
      {
        parseUrl: 'https://wiadomosci.gazeta.pl/wiadomosci/0,0.html',
        category: ['Wiadomości'],
      },
      {
        parseUrl: 'https://weekend.gazeta.pl/weekend/0,177341.html',
        category: ['RODZINA'],
      },
      {
        parseUrl: 'https://weekend.gazeta.pl/weekend/0,177342.html',
        category: ['HISTORIA'],
      },
      {
        parseUrl: 'https://weekend.gazeta.pl/weekend/0,177343.html',
        category: ['BIOGRAFIE'],
      },
      {
        parseUrl: 'https://weekend.gazeta.pl/weekend/0,181991.html',
        category: ['PODRÓŻE'],
      },
      {
        parseUrl: 'https://weekend.gazeta.pl/weekend/0,177333.html',
        category: ['ROZMOWA'],
      },
      {
        parseUrl: 'https://kobieta.gazeta.pl/kobieta/0,0.html',
        category: ['Kobieta'],
      },
      {
        parseUrl: 'https://www.gazeta.pl/0,0.htm',
        category: ['Kobieta'],
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
    console.log('Finish Parse and restart parse!')
    setTimeout(() => {
      this.startParse()
    }, 30000)
  }
  async searchArticles (entries) {
      let $ = await this.requestGetPage({ url: entries.parseUrl })
      let urls = []
      $('.content_wrap .main_content ul.list_tiles>li.entry>a').each( (index, el) => {
        urls.push($(el).attr('href'))
      })
      $('.content_wrap ul.indexPremium__list>li.indexPremium__element>a').each( (index, el) => {
        urls.push($(el).attr('href'))
      })
    $('.c-main-content .sectionTiles__box>a').each( (index, el) => {
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
          let urlParse = new URL(page)
          let catFromUrl = urlParse.pathname.split('/')
          if (catFromUrl[1]) {
            categories.push(catFromUrl[1])
          }
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
      return true
  }
}

export {
  Gazetapl,
}