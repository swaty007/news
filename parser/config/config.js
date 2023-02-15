import { parserBD } from '../../.env.js'
// const parserBD = import('../../.env.js')
const config = {
  development: parserBD,
  // test: {
    // username: env.PG_USERNAME,
    // password: env.PG_PASSWORD,
    // database: 'sample_db',
    // host: env.PG_HOST,
    // port: env.PG_PORT,
    // dialect: 'postgres',
  // },
  production: parserBD,
}

export default config