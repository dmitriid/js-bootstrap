/***
 * Compile *.styl files to css.css:
 *      node build_css.js
 *
 * Watch *.styl files and compile them to css.css:
 *      node build_css.js -w
 */

var chokidar = require('chokidar');
var stylus = require('stylus');
var fs = require('fs');
var clc = require('cli-color');
var filesize = require('filesize');

require('es6-promise').polyfill();
//var postcss = require('postcss');
var cssnano = require('cssnano');

// make a new file watcher
var css = {};
var inited = false;

var entry_dir  = process.env.ENTRY;
var output_dir = process.env.OUT;

var outFile = output_dir + '/css.css';

var opt = require('node-getopt').create([
        ['w', '', 'watch the files'],
        ['o', '', 'optimize the files']
    ])              // create Getopt instance
    .bindHelp()     // bind option 'help' to default action
    .parseSystem(); // parse command line

var watch = opt.options.w ? true : false;
var optimize = opt.options.o ? true : false;

var render_stats = function(){
    if(!inited) return;

    try {
      fs.accessSync(path, fs.F_OK);
    } catch (e) {
      if(!watch) process.exit(0);
      return;
    }

    var stats = fs.statSync(outFile);
    var fileSizeInBytes = stats.size;
    var kb = filesize(fileSizeInBytes, {base: 10, round: 2});

    console.log(clc.green(outFile), " ", clc.white(kb));

    if(!watch) process.exit(0);
};

var do_optimize = function()
{
    try {
      fs.accessSync(path, fs.F_OK);
    } catch (e) {
      if (!watch) process.exit(0);
      return;
    }

    if (process.env.BUILD !== 'prod' || !optimize || !inited) {
        render_stats();
        return;
    }
    console.log(clc.yellow('Optimizing file...'));
    var str = fs.readFileSync(outFile);
    cssnano.process(str).then(function (result) {
        fs.writeFileSync(outFile, result.css);
        render_stats();
    });
};

var do_render = function(){
  var out = Object.keys(css).map(function (key) {
    return css[key];
  }).join('\n\n');

  fs.writeFileSync(outFile, out);
  do_optimize();
};

var render = function (filename) {
  console.log('Rebuilding ' + filename);

  var str = fs.readFileSync(filename);

  stylus(str.toString())
      .set('filename', filename)
      //.include('css/css')
      .render(function (err, rendered_css) {
        if (err) {
          console.log(clc.red('Could not parse file ', filename, err));
          if(!watch) process.exit(1);
          return;
        }
        css[filename] = rendered_css;
        do_render();
      });
};

// register for the `change` event
var watcher = chokidar.watch(entry_dir + '/**/*.styl');

watcher
    .on('add', render)
    .on('change', render)
    .on('unlink', function(filename){
      delete css[filename];
      do_render();
    })
    .on('error', function(error){
      console.log(clc.red('Could not parse file: ', error));
      if (!watch) process.exit(1);
    })
    .on('ready', function(){
        inited = true;
        do_optimize();
    });

setInterval(function () {}, 1000);
