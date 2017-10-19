"use strict";

const fs = require("fs"),
      gutil = require("gulp-util"),
      path = require("path"),
      nunjucks = require("nunjucks"),
      through = require("through2");

nunjucks.configure("src/templates", { noCache: true });

function loadObjectModule(path) {
    return fs.existsSync(path) ? require(path) : {};
}

function compile() {
    return through.obj(function(file, enc, callback) {
        if (file.isNull()) {
            callback(null, file);
            return;
        }
        if (file.isStream()) {
            callback(new PluginError("Streaming not supported"));
            return;
        }
        if (path.basename(file.path).startsWith("_")) {
            callback();
            return;
        }
        try {
            const globalDataPath = path.join(file.cwd, "src", "global.js");

            const globalData = loadObjectModule(globalDataPath);

            const relativePath = path.relative(file.cwd, file.path),
                  fileDataPath = relativePath
                  .replace(/templates/, "data")
                  .replace(/.(html|nunjucks|jinja)/, ".js");

            const absFileDataPath = path.join(file.cwd, fileDataPath);

            const fileData = loadObjectModule(absFileDataPath);

            const data = Object.assign({}, globalData, fileData);

            file.contents = new Buffer(nunjucks.render(file.path, data));
            this.push(file);
        } catch (error) {
            this.emit("error", new PluginError(error, {filename: file.path}));
        }
        callback();
    });
}

module.exports = compile;
