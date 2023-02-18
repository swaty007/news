const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: {
    App: ['./js/scripts.ts', './scss/style.scss'],
    // vendor: [
    // 'vue',
    // 'vue-router',
    // ]
  },
  watch: true,
  output: {
    path: path.resolve(__dirname, './js'),
    filename: 'scripts-bundled.js',
  },
  module: {
    rules: [
      // {
      //     test: /\.vue$/,
      //     loader: 'vue-loader'
      // },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: [['@babel/transform-runtime']],
          },
        },
      },
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          // appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(s*)css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.jade$/,
        use: ['pug-loader'],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'js'),
    compress: true,
    port: 9000,
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      // 'vue$': 'vue/dist/vue.common.js',
      // 'vue$': 'vue/dist/vue.esm.js',
    },
  },
  plugins: [
    // убедитесь что подключили плагин!
    // new VueLoaderPlugin()
    new ESLintPlugin(),
    new MiniCssExtractPlugin({
      filename: '../scss/style.css',
    }),
  ],
  // mode: 'production',
  mode: 'development',
}
