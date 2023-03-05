import { abstractDomain } from './abstractDomain'
import { validationService, fixHtmlText } from '../helpers/helpers'


class Healthline extends abstractDomain implements Domain {
  parseEntries: parseEntries[]
  mainLang: Languages

  constructor (db: { [key: string]: any }) {
    super(db)
    this.mainLang = 'en'
    this.parseEntries = [
      {
        parseUrl: 'https://www.healthline.com/coronavirus',
        category: ['Covid-19'],
      },
      {
        parseUrl: 'https://www.healthline.com/breast-cancer',
        category: ['Breast Cancer'],
      },
      {
        parseUrl: 'https://www.healthline.com/irritable-bowel-disease',
        category: ['Inflammatory Bowel Disease'],
      },
      {
        parseUrl: 'https://www.healthline.com/migraine',
        category: ['Migraine'],
      },
      {
        parseUrl: 'https://www.healthline.com/multiple-sclerosis',
        category: ['Multiple Sclerosis'],
      },
      {
        parseUrl: 'https://www.healthline.com/rheumatoid-arthritis',
        category: ['Rheumatoid Arthritis'],
      },
      {
        parseUrl: 'https://www.healthline.com/type-2-diabetes',
        category: ['Type 2 Diabetes'],
      },
    ]
  }
  async startParse () {
    for (const entries of this.parseEntries) {
      await this.searchArticles(entries)
    }
    console.log('Finish Parse Healthline!')
  }
  async searchArticles (entries: parseEntries) {
    const $ = await this.requestGetPage({ url: entries.parseUrl })
    const urls: string[] = []
    $('figure>a').each( (index, el) => {
      const href = $(el).attr('href')
      if (href) {
        if (href.startsWith('/')) {
          urls.push('https://www.healthline.com' + href)
        } else {
          urls.push(href)
        }
      }
    })
    for (const page of urls) {
      if (await this.uniqueCheck(page)) {
        // console.log('uniqueCheck failed:', page)
        continue
      }
      try {
        const $ = await this.requestGetPage({ url: page })
        let post_title = $('h1.css-0').text().trim()
        if(!post_title) {
          post_title = $('h1').text().trim()
        }
        let post_excerpt = $('head meta[name="description"]').attr('content')
        if (!post_excerpt) {
          post_excerpt = $('head meta[name="Description"]').attr('content')
        }
        post_excerpt = post_excerpt ? post_excerpt.trim() : ''
        let post_content = $('article.article-body').html()
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
        categories.push(...entries.category)
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
        await this.parser.newPostGreen(result)
      } catch (e) {
        console.error('searchArticles', e)
      }
    }
    return true
  }
}

export {
  Healthline,
}