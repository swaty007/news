'use strict'
import { Model } from "sequelize"
export default (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  Post.init({
    url: DataTypes.STRING(555),
    name: DataTypes.STRING(750),
    status: DataTypes.INTEGER,
    html: DataTypes.TEXT('long'),
  }, {
    sequelize,
    modelName: 'Post',
  })
  return Post
}