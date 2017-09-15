const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const ip = require('ip');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  entry: [
    'babel-polyfill',
    './docs/src/index.js',
  ],
  output: {
    path: path.resolve(__dirname, './docs/dist'),
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.md$/,
        use: [
          'vue-loader',
          {
            loader: path.resolve(__dirname, './dist/index.js'),
            options: {
              exportSource: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm',
    },
    extensions: ['.js', '.json', '.vue'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(IS_PRODUCTION ? 'production' : 'development'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: IS_PRODUCTION ? '../index.html' : 'index.html',
      template: './docs/src/index.html',
    }),
  ],
  devServer: {
    host: ip.address(),
    hot: true,
    stats: {
      colors: true,
      chunks: false,
    },
  },
  devtool: 'eval',
};

if (IS_PRODUCTION) {
  module.exports.devtool = false;
  module.exports.output.publicPath = './dist/';
  module.exports.output.filename = 'app.[hash].js';
  module.exports.output.chunkFilename = '[id].[chunkhash].js';
  module.exports.output.hashDigestLength = 7;
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new webpack.optimize.UglifyJsPlugin(),
  ]);
}
