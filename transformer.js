var semver = require("semver");
var css2rn = require("css-to-react-native-transform").default;
var upstreamTransformer = null;
var reactNativeVersionString = require("react-native/package.json").version;
var reactNativeMinorVersion = semver(reactNativeVersionString).minor;
var appRoot = require("app-root-path");
var transformers = {};

if (reactNativeMinorVersion >= 56) {
  upstreamTransformer = require("metro/src/reactNativeTransformer");
} else if (reactNativeMinorVersion >= 52) {
  upstreamTransformer = require("metro/src/transformer");
} else if (reactNativeMinorVersion >= 47) {
  upstreamTransformer = require("metro-bundler/src/transformer");
} else if (reactNativeMinorVersion === 46) {
  upstreamTransformer = require("metro-bundler/build/transformer");
} else {
  // handle RN <= 0.45
  var oldUpstreamTransformer = require("react-native/packager/transformer");
  upstreamTransformer = {
    transform({ src, filename, options }) {
      return oldUpstreamTransformer.transform(src, filename, options);
    }
  };
}

function printCssObject(cssObject) {
  return "const uenoCssModules = require('react-native-ueno-css-modules');\n" +
         "module.exports = uenoCssModules.mapStyles(" + JSON.stringify(cssObject) + ");";
};

module.exports.transform = function(src, filename, options) {

  if (typeof src === "object") {
    // handle RN >= 0.46
    ({ src, filename, options } = src);
  }

  if (filename.endsWith(".css")) {
    var cssObject = css2rn(src, { parseMediaQueries: true });

    return upstreamTransformer.transform({
      src: printCssObject(cssObject),
      filename,
      options
    });
  }

  if (filename.endsWith(".styl")) {
    if (!transformers.stylus) {
      transformers.stylus = require("stylus");
    }

    var cssObject = css2rn(transformers.stylus.render(src, { filename }), {
      parseMediaQueries: true
    });

    return upstreamTransformer.transform({
      src: printCssObject(cssObject),
      filename,
      options
    });
  }

  if (filename.endsWith(".less")) {
    if (!transformers.less) {
      transformers.less = require("less");
    }
    return transformers.less.render(src).then(result => {
      var cssObject = css2rn(result.css, { parseMediaQueries: true });
      return upstreamTransformer.transform({
        src: printCssObject(cssObject),
        filename,
        options
      });
    });
  }

  if (filename.endsWith(".scss") || filename.endsWith(".sass")) {
    if (!transformers.sass) {
      transformers.sass = require("node-sass");
    }
    var result = transformers.sass.renderSync({
      data: src,
      includePaths: [path.dirname(filename), appRoot]
    });
    var css = result.css.toString();
    var cssObject = css2rn(css, { parseMediaQueries: true });

    return upstreamTransformer.transform({
      src: printCssObject(cssObject),
      filename,
      options
    });
  }

  return upstreamTransformer.transform({ src, filename, options });
};

