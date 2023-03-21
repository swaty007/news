type Languages = 'en' | 'uk' | 'ru' | 'zh' | 'de' | 'pl' | 'da' | 'nb'
// enum Languages {
//   en = 'en',
//   uk = 'uk',
//   ru = 'ru',
//   zh = 'zh',
//   de = 'de',
//   pl = 'pl',
//   da = 'da',
//   nb = 'nb'
// }

interface localPost extends RestAPIPost {
  url: string
  mainLang: Languages
  // post_date_gmt,
}
interface RestAPIPost {
  post_title: string
  post_excerpt: string
  post_content: string
  // post_date_gmt,
  image: { guid: string }
  tags: string[]
  categories: string[]
}

interface parseEntries {
  parseUrl: string
  category: string[]
}

interface Class<T> {
  new(db: object): T;
}

interface Domain {
  events: events.EventEmitter
  requestTimeout: number
  parseEntries: { parseUrl: string; category: string[] }[]
  mainLang: Languages
  init(cbFunction: Parser): Promise<events.EventEmitter>
}

interface ParserInstance {
  insertUrl: string
  languages: Languages[]
  totalRequest: { time: number }
  db: { [key: string]: any } | undefined
  translates: Map<Languages, GoogleTranslate>
  init(): Promise<void>
  startLoop(): Promise<void>
  initEmitter(emitter: Class<Domain>): Promise<void>
  newPost(originalPost: localPost): Promise<void>
  // setPostLanguage(originalPost: localPost): Promise<RestAPIPost[]>
  setPostLanguage(originalPost: localPost): Promise<{ [x: string]: RestAPIPost }>
  translatePost(originalPost: localPost, lang: Languages): Promise<RestAPIPost>
  // savePost(translates: RestAPIPost[], mainLang: Languages): Promise<boolean>
  savePost(translates: { [key in Languages]: RestAPIPost }, mainLang: Languages): Promise<boolean>
}