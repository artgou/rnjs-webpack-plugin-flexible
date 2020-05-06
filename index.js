function WebpackPluginFlexible (options = {}) {
  var defaultOptions = {
    maxWidth: 750,  // 页面最大宽度, 0表示宽度用100%自适应
    size: 750,      // 美术页面宽度(px)
    remUnit: 75,    // 1rem === ?px 网页根元素的字体大小
    ignore: [],      // 忽略页面，支持正则和字串 ['prod-detail.html', /prod-.*/]
    flexibleJSUrl: '/static/libs/rich/flexible.js'    // flexible.js文件(也可以用别的文件把flexible.js包起来)
  }
  // 修改windows下的正则路径问题
  if (Array.isArray(options.ignore) && process.platform === 'win32') {
    for (let i = 0; i < options.ignore.length; i++) {
      let item = options.ignore[i]
      if (istype(item, 'RegExp')) {
        let str = item.toString()
        str = str.substr(1, str.length - 2)
        if (str.indexOf('/') !== -1) {
          options.ignore[i] = new RegExp(str.replace(/\//g, '\\'))
        }
      }
    }
  }
  this.options = Object.assign({}, defaultOptions, options);
}

WebpackPluginFlexible.prototype.apply = function (compiler) {
  var self = this;
  if (compiler.hooks) {
    compiler.hooks.compilation.tap('HtmlWebpackReplace', function (compilation) {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
        'HtmlWebpackReplace',
        self.innerScript.bind(self)
      );
    });
  } else {
    compiler.plugin('compilation', compilation => {
      compilation.plugin(
        'html-webpack-plugin-alter-asset-tags',
        self.innerScript.bind(self)
      );
    });
  }
};

WebpackPluginFlexible.prototype.innerScript = function (htmlPluginData, callback) {
  var isIgnore = false;
  var template = htmlPluginData.outputName;
  if (this.options.hasOwnProperty('ignore') && this.options.ignore.length > 0) {
    let templatePath = htmlPluginData.plugin.options.template
    this.options.ignore.map(item => {
      if (item === template || (istype(item, 'RegExp') && templatePath.match(item))) {
        isIgnore = true;
      }
    });
  }
  if (!isIgnore) {
    var maxWidth = this.options.maxWidth
    if (maxWidth && typeof maxWidth === 'string') {
      throw new Error('maxWidth只支持数值(px)，0表示最大宽度为100%')
    }
    let opts = {
      maxWidth: this.options.maxWidth,
      size: this.options.size,
      remUnit: this.options.remUnit,
    }
    htmlPluginData.body.push({
      tagName: 'script',
      attributes: {
        type: 'text/javascript',
      },
      closeTag: true,
      innerHTML: `;var flexibleOptions = ${JSON.stringify(opts)};`
    })
    htmlPluginData.body.push({
      tagName: 'script',
      attributes: {
        type: 'text/javascript',
        src: this.options.flexibleJSUrl
      },
      closeTag: true,
    })
  }
  callback(null, htmlPluginData);
};

function istype (o, type) {
  return (
    Object.prototype.toString.call(o) === '[object ' + (type || 'Object') + ']'
  );
}

module.exports = WebpackPluginFlexible;
