function WebpackPluginFlexible (options = {}) {
  var defaultOptions = {
    maxWidth: 750,  // 页面最大宽度, 0表示宽度用100%自适应
    size: 750,      // 美术页面宽度(px)
    remUnit: 75,    // 1rem === ?px 网页根元素的字体大小
    ignore: []      // 忽略页面，支持正则和字串 ['prod-detail.html', /prod-.*/]
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
    this.options.ignore.map(item => {
      if (item === template || (istype(item, 'RegExp') && template.match(item))) {
        isIgnore = true;
      }
    });
  }
  if (!isIgnore) {
    var maxWidth = this.options.maxWidth
    if (maxWidth && typeof maxWidth === 'string') {
      throw new Error('maxWidth只支持数值(px)，0表示最大宽度为100%')
    }
    htmlPluginData.head.unshift({
      tagName: 'script',
      attributes: {
        type: 'text/javascript'
      },
      closeTag: true,
      innerHTML: `(function(win,lib){var doc=win.document;var docEl=doc.documentElement;var metaEl=doc.querySelector('meta[name="viewport"]');var flexibleEl=doc.querySelector('meta[name="flexible"]');var dpr=0;var scale=0;var tid;var flexible=lib.flexible||(lib.flexible={});if(metaEl){var match=metaEl.getAttribute("content").match(/initial-scale=([d.]+)/);if(match){scale=parseFloat(match[1]);dpr=parseInt(1/scale)}}else{if(flexibleEl){var content=flexibleEl.getAttribute("content");if(content){var initialDpr=content.match(/initial-dpr=([d.]+)/);var maximumDpr=content.match(/maximum-dpr=([d.]+)/);if(initialDpr){dpr=parseFloat(initialDpr[1]);scale=parseFloat((1/dpr).toFixed(2))}if(maximumDpr){dpr=parseFloat(maximumDpr[1]);scale=parseFloat((1/dpr).toFixed(2))}}}}if(!dpr&&!scale){var isAndroid=win.navigator.appVersion.match(/android/gi);var isIPhone=win.navigator.appVersion.match(/iphone/gi);var devicePixelRatio=win.devicePixelRatio;if(isIPhone){if(devicePixelRatio>=3&&(!dpr||dpr>=3)){dpr=3}else{if(devicePixelRatio>=2&&(!dpr||dpr>=2)){dpr=2}else{dpr=1}}}else{dpr=1}scale=1/dpr}docEl.setAttribute("data-dpr",dpr);if(!metaEl){metaEl=doc.createElement("meta");metaEl.setAttribute("name","viewport");metaEl.setAttribute("content","initial-scale="+scale+", maximum-scale="+scale+", minimum-scale="+scale+", user-scalable=no");if(docEl.firstElementChild){docEl.firstElementChild.appendChild(metaEl)}else{var wrap=doc.createElement("div");wrap.appendChild(metaEl);doc.write(wrap.innerHTML)}}function refreshRem(){var width=docEl.getBoundingClientRect().width;if(${this.options.maxWidth}>0&&(width/dpr>${this.options.maxWidth})){width=${this.options.maxWidth}*dpr}var rem=width/${this.options.size / this.options.remUnit};docEl.style.fontSize=rem+"px";flexible.rem=win.rem=rem}win.addEventListener("resize",function(){clearTimeout(tid);tid=setTimeout(refreshRem,300)},false);win.addEventListener("pageshow",function(e){if(e.persisted){clearTimeout(tid);tid=setTimeout(refreshRem,300)}},false);if(doc.readyState==="complete"){doc.body.style.fontSize=12*dpr+"px"}else{doc.addEventListener("DOMContentLoaded",function(e){doc.body.style.fontSize=12*dpr+"px"},false)}refreshRem();flexible.dpr=win.dpr=dpr;flexible.refreshRem=refreshRem;flexible.rem2px=function(d){var val=parseFloat(d)*this.rem;if(typeof d==="string"&&d.match(/rem$/)){val+="px"}return val};flexible.px2rem=function(d){var val=parseFloat(d)/this.rem;if(typeof d==="string"&&d.match(/px$/)){val+="rem"}return val}})(window,window["lib"]||(window["lib"]={}));`
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
