## Flexible+webpack，在 lib-flexible 的基础上加入了页面最大宽度定义

## 使用方法
```

const FlexiblePlugin = require('rnjs-webpack-plugin-flexible');

plugins: [
  new FlexiblePlugin({
    maxWidth: 750,  // 页面最大宽度, 0表示宽度用100%自适应
    size: 750,      // 美术页面宽度(px)
    remUnit: 75,    // 1rem === ?px 网页根元素的字体大小
    ignore: []      // 忽略页面，支持正则和字串 ['prod-detail.html', /prod-.*/]
  })
]

```