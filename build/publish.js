var fs = require('fs')
var path = require('path')
const semver = require('semver');
const shell = require('child_process');
var rm = require('rimraf')

// 升级版本号
function upgradeVersion (dir = './') {
  let pkgText = fs.readFileSync(path.resolve(dir, './package.json'))
  let pkgObj = JSON.parse(pkgText)
  let pkgVer = semver.inc(pkgObj.version, 'patch');
  pkgObj.version = pkgVer
  let pkgText2 = JSON.stringify(pkgObj, true, 2)
  fs.writeFileSync(path.resolve(dir, 'package.json'), pkgText2)
  return pkgVer
}

// 自动发布NPM
function publish() {
  var srcDir = path.resolve(__dirname, '../src');
  var distDir = path.resolve(__dirname, '../dist');
  rm(distDir, async function (err) {
    if (err) {
      console.log(err)
      return
    }
    console.log('开始发布...')
    let dir = './';
    upgradeVersion(dir)
    shell.exec(`cd ${dir} && npm publish --registry https://registry.npmjs.org`, function(err, stdout, stderr) {
      if (err) {
        console.error('发布失败: ' + err);
        return;
      } else {
        console.log('发布结果: ' + stdout);
      }
    });
  })
}

publish();
