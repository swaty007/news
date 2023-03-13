import { abstractDomain } from './abstractDomain'
import { validationService, fixHtmlText } from '../helpers/helpers'


class Gazetapl extends abstractDomain implements Domain {
  parseEntries: parseEntries[]
  mainLang: Languages

  constructor (db: { [key: string]: any }) {
    super(db)
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
  async startParse () {
    for (const entries of this.parseEntries) {
      try {
        await this.searchArticles(entries)
      } catch (err) {
        console.log('searchArticles', err)
      }
    }
    console.log('Finish Parse Gazetapl!')
    // setTimeout(() => {
    //   this.startParse()
    // }, 30000)
  }
  async searchArticles (entries: parseEntries) {
      const $ = await this.requestGetPage({ url: entries.parseUrl })
      const urls: string[] = []
      $('.content_wrap .main_content ul.list_tiles>li.entry>a').each( (index, el) => {
        const href = $(el).attr('href')
        if (href) {
          urls.push(href)
        }
      })
      $('.content_wrap ul.indexPremium__list>li.indexPremium__element>a').each( (index, el) => {
        const href = $(el).attr('href')
        if (href) {
          urls.push(href)
        }
      })
    $('.c-main-content .sectionTiles__box>a').each( (index, el) => {
      const href = $(el).attr('href')
      if (href) {
        urls.push(href)
      }
    })
    // $('a.related_article_link').each( (index, el) => {
    //   const href = $(el).attr('href')
    //   if (href) {
    //     urls.push(href)
    //   }
    // })
    // $('.newsBox__popularList .newsBox__itemLink').each( (index, el) => {
    //   const href = $(el).attr('href')
    //   if (href) {
    //     urls.push(href)
    //   }
    // })
      for (const page of urls) {
        if (await this.uniqueCheck(page)) {
          // console.log('uniqueCheck failed:', page)
          continue
        }
        try {
          const $ = await this.requestGetPage({ url: page })
          let post_title = $('#article_wrapper #article_title').text().trim()
          if(!post_title) {
            post_title = $('.article .article__sidebar h1.article__title').text().trim()
          }
          let post_excerpt = $('head meta[name="Description"]').attr('content')
          if (!post_excerpt) {
            $('head meta[name="description"]').attr('content')
          }
          post_excerpt = post_excerpt ? post_excerpt.trim() : ''
          let post_content = $('section.art_content').html()
          post_content = post_content ? fixHtmlText(post_content.trim()) : ''
          if (!post_title || !post_content || post_title.length > 800 || post_content.length < 1200) {
            console.error('Wrong Post Data: ', page)
            await this.db.Post.create({
              url: page,
              status: -1,
            })
            continue
          }
          const image = {
            guid: $('head meta[property="og:image"]').attr('content') ?? '',
          }
          const tags: string[] = []
          $('.bottom_section .tags ul.tags_list li.tags_item a').each((tI, tEl) => {
            tags.push($(tEl).text().trim())
          })
          // console.log(post_content)

          const categories: string[] = []
          const urlParse = new URL(page)
          const catFromUrl = urlParse.pathname.split('/')
          if (catFromUrl[1]) {
            categories.push(catFromUrl[1])
          }
          if (catFromUrl[2] && catFromUrl[4]) {
            categories.push(catFromUrl[2])
          }
          if (!categories.length) {
            categories.push(...entries.category)
          }
          // console.log('categories', categories)
          const result: localPost = {
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
  Gazetapl,
}