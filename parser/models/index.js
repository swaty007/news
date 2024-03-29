// import { readdirSync } from "fs"
// import { dirname } from "path"
import { Sequelize, DataTypes } from "sequelize"
// import { fileURLToPath } from 'url'
// import process from 'process'
const env = process.env.NODE_ENV || 'development'
import config from "../config/config.js"
import Post from './post.js'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

const db = {}
const sequelize = new Sequelize(config[env])

export default (async () => {
  // const files = readdirSync(__dirname)
  // .filter(
  //   (file) => file.indexOf('.') !== 0
  //     && file !== basename(__filename)
  //     && file.slice(-3) === '.js',
  // )
  // for await (const file of files) {
  //   const model = await import(`./${file}`)
  //   const namedModel = model.default(sequelize, DataTypes)
  //   db[namedModel.name] = namedModel
  // }

  const namedModel = Post(sequelize, DataTypes)
  db[namedModel.name] = namedModel

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  db.sequelize = sequelize
  db.Sequelize = Sequelize

  return db
})()