"use strict";

const gutil = require("gulp-util"),
      path = require("path"),
      nunjucks = require("nunjucks"),
      through = require("through2");

const PluginError = gutil.PluginError.bind(null, "gulp-swg");

function compile() {
    return through.obj(function(file, enc, callback) {
        if (file.isNull()) { callback(null, file); return; }
        if (file.isStream()) {
            callback(new PluginError("Streaming not supported"));
            return;
        }
        try {
            const relativePath = path.relative(file.cwd, file.path),
                  dataFile = relativePath
                  .replace(/template/, "data")
                  .replace(/.html/, ".js");

            const data = require(dataFile);

            file.contents = new Buffer(nunjucks.renderString(file.contents.toString(), data));
            this.push(file);
        } catch (error) {
            this.emit(new PluginError(err, {filename: file.path}));
        }
        callback();
    });
}

module.exports = compile;
