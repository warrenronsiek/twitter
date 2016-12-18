/**
 * Created by warren on 12/10/16.
 */
const path = require('path');
const webpack = require('webpack');
const validator = require('webpack-validator');

const paths = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  nodeModules: path.join(__dirname, 'node_modules')
};

const build = {
  devtool: 'source-map',
  entry: paths.src,
  resolve: {
    extensions: ['', '.js']
  },
  target: 'node',
  output: {
    path: paths.dist,
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: paths.nodeModules
      }
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false, drop_console: true},
      beautify: false,
      comments: false,
      mangle: {except: ['$', 'webpackJsonp'], screw_ie8: true, keep_fnames: false}
    })
  ]
};

module.exports = validator(build);
