import events from 'events'
import { abstractDomain } from './abstractDomain.js'
import { validationService, fixHtmlText } from '../helpers/helpers.js'


class Gazetapl extends abstractDomain {
  constructor (db) {
    super(db)
    this.events = new events.EventEmitter()
    this.mainLang = 'pl'
    this.parseUrl = 'https://wiadomosci.gazeta.pl/wojna-w-ukrainie'
    this.category = ['wojna w ukrainie']
    // this.parseUrl = 'https://fakty.tvn24.pl/fakty-o-swiecie,61'
  }
  init () {
    this.startParse()
    return this.events
  }
  async startParse () {
    let article = await this.searchArticles()
    console.log(article)
  }
  async searchArticles () {
    let $ = await this.requestGetPage({ url: this.parseUrl })
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
        let post_excerpt = $('head meta[name="Description"]').attr('content')
        post_excerpt = post_excerpt ? post_excerpt.trim() : post_excerpt
        let post_content = fixHtmlText($('section.art_content').html().trim())
        let post_date_gmt = 'no date'
        let image = {
          guid: $('head meta[property="og:image"]').attr('content'),
        }
        let tags = []
        $('.bottom_section .tags ul.tags_list li.tags_item a').each((tI, tEl) => {
          tags.push($(tEl).text().trim())
        })
        // console.log(post_content)

        let categories = this.category
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
        this.events.emit('newPost', result)
        return
      } catch (e) {
        console.error('searchArticles', e)
      }
    }
  }
}

export {
  Gazetapl,
}