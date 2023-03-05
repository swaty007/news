import { abstractDomain } from './abstractDomain'
import { validationService, fixHtmlText } from '../helpers/helpers'


class De24live extends abstractDomain implements Domain {
  parseEntries: parseEntries[]
  mainLang: Languages

  constructor (db: { [key: string]: any }) {
    super(db)
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
      {
        parseUrl: 'https://www.de24live.de/society',
        category: ['SOCIETY'],
      },
      {
        parseUrl: 'https://www.de24live.de/top-stories',
        category: ['TOP STORIES'],
      },
      {
        parseUrl: 'https://www.de24live.de/welt-international',
        category: ['INTERNATIONAL'],
      },
      {
        parseUrl: 'https://www.de24live.de/politik',
        category: ['POLITIK'],
      },
      {
        parseUrl: 'https://www.de24live.de/sport',
        category: ['sport'],
      },
    ]
  }
  async startParse () {
    for (const entries of this.parseEntries) {
      await this.searchArticles(entries)
    }
    console.log('Finish Parse De24live!')
    // setTimeout(() => {
    //   this.startParse()
    // }, 30000)
  }
  async searchArticles (entries: parseEntries) {
    const $ = await this.requestGetPage({ url: entries.parseUrl })
    const urls: string[] = []
    // $('#wrap section.banner .xlBox a.story').each( (index, el) => {
    $('#wrap a.story').each( (index, el) => {
      const href = $(el).attr('href')
      if (href) {
        urls.push(href)
      }
    })
    for (const page of urls) {
      if (await this.uniqueCheck(page)) {
        // console.log('uniqueCheck failed:', page)
        continue
      }
      try {
        const $ = await this.requestGetPage({ url: page })
        const post_title = $('.articleTitelBox h1').text().trim()
        if(!post_title) {
          // post_title = $('.article .article__sidebar h1.article__title').text().trim()
        }
        let post_excerpt = $('head meta[name="description"]').attr('content')
        if (!post_excerpt) {
          post_excerpt = $('head meta[name="Description"]').attr('content')
        }
        post_excerpt = post_excerpt ? post_excerpt.trim() : ''
        let post_content = $('div.articleTextBox').html()
        post_content = post_content ? fixHtmlText(post_content.trim()) : ''
        if (!post_title || !post_content || post_title.length > 800) {
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
        // $('.bottom_section .tags ul.tags_list li.tags_item a').each((tI, tEl) => {
        //   tags.push($(tEl).text().trim())
        // })
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
        // console.log('categories2', categories)
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
  De24live,
}