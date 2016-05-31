var path = require('path');
var process = require('process');
var webpack = require('webpack');

var entry_dir = process.env.ENTRY;
var entry = path.extname(entry_dir) === '.js' ? entry_dir : (entry_dir + '/index.js');
var filename = path.extname(entry_dir) === '.js' ? path.basename(entry_dir) : path.basename(entry_dir) + '.js';
var output_dir = process.env.OUT ? process.env.OUT : path.join(__dirname, './dist/');


var config = {
  entry:   {
    app: [
      path.join(__dirname, entry),
    ]
  },
  output:  {
    path: output_dir,
    filename:          filename,
    sourceMapFilename: filename + '.map',
    pathinfo: true
  },
  module:  {
    noParse: [/.*bootstrap\.js/],
    loaders: [
      {
        test:   /\.js$/,
        loader: 'babel',
        query:  {
          presets: ['es2015', 'stage-0', 'react'],
          compact: false
        }
      },
      {
        test:   /\.json$/,
        loader: 'json'
      }
    ]
  },
  plugins: [],
  bail: false,
  target: 'web'
};

if (process.env.BUILD === 'dev') {
  config.devtool = 'source-map';
}

if (process.env.BUILD === 'stage') {
  config.devtool = 'source-map';
  config.output.pathinfo = false;
  config.plugins = config.plugins.concat(
    [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        stats:    true,
        mangle:   {
          except: ['$']
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin()
    ]
  );

  config.bail = true;
}

if (process.env.BUILD === 'prod') {
  config.output.pathinfo = false;
  config.plugins = config.plugins.concat(
    [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        stats:    true,
        mangle:   {
          except: ['$']
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin()
    ]
  );

  config.bail = true;
}

module.exports = config;

