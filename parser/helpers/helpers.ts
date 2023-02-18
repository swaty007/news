import { stripHtml } from 'string-strip-html'
import { Browser } from "puppeteer"

function validationService (res: any) {
  console.error('Error Makes :', res)
}
function fixHtmlText (text: string) {
  const html = stripHtml(text, {
    ignoreTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'i', 'p',
      'strong', 'b', 'br', 'code', 'ul', 'li', 'ol',
      'table', 'tr', 'thead', 'tbody', 'th', 'iframe',
      'blockquote',
      // figure img
    ],
    // ignoreTagsWithTheirContents: ['p'],
    // skipHtmlDecoding: true,
  }).result

  return html.replace(/&nbsp;/g, '')
  .replace(/&amp;/g, '')
  .replace(/&lt;/g, '')
  .replace(/&gt;/g, '')
  .replace(/&#039;/g, '')
  .replace(/&amp;nbsp;/g, "")
  .replace(/MIFF Denmark/ig, 'Infinitum News')
  .replace(/Gazeta.pl/ig, 'news.infinitum.tech')
  .replace(/pcpm.org.pl/ig, 'dmg.news')
  .replace(/(\s|^)miff(\s|$)/ig, ' Infinitum News ')
  .replace(/(\s|^)Gazeta.pl(\s|$)/ig, ' Infinitum News ')
  .replace(/(\s|^)pcpm.org.pl(\s|$)/ig, ' dmg.news ')
  .replace(/<span\b[^<]*>REKLAMA<\/span>/gm, 'dmg.news')
  // .replace(/<a\b[^>]*>(.*?)<\/a>/gm, '$1')
  // .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // .replace(/\[caption\b[^<]*(?:(?!<\/caption])<[^<]*)*\[\/caption]/gi, '')
  // .replace(/<a\b[^<]*>(.*?)<\/a>/gm, '$1')
  // .replace(/<span\b[^<]*>(.*?)<\/span>/gm, '$1')

  // console.log(stripHtml(html).allTagLocations.reduce(
  //   (acc, [from, to]) => `${acc}${html.slice(from, to)}`,
  //   ""
  // ))
}

async function getCurrentPage (browser: Browser) {
  return (await browser.pages())[0]
}

function filterFileNameText (text: string) {
  // /[^0-9a-z-]/g
  return text.replace(/[^_\-@.()+*/'a-zA-Z0-9]/g, '')
}

export {
  validationService,
  fixHtmlText,
  getCurrentPage,
}