'use strict'; // 使用严格模式

// 作为第一件事设置环境变量，这样任何读取它的代码都知道正确的环境
process.env.BABEL_ENV = 'test'; // 设置Babel的环境变量为测试
process.env.NODE_ENV = 'test'; // 设置Node的环境变量为测试
process.env.PUBLIC_URL = ''; // 设置公共URL环境变量为空

// 如果有未处理的Promise拒绝，则让脚本崩溃，而不是默默地忽略它们。未来，未处理的Promise拒绝将导致Node.js进程以非零退出码结束。
process.on('unhandledRejection', err => {
  throw err; // 抛出错误
});

// 确保环境变量被读取
require('../config/env');

const jest = require('jest'); // 引入Jest模块
const execSync = require('child_process').execSync; // 引入child_process模块的execSync方法，用于同步执行shell命令
let argv = process.argv.slice(2); // 获取命令行参数

// 检查当前目录是否在Git仓库中
function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true; // 如果是，返回true
  } catch (e) {
    return false; // 如果不是，返回false
  }
}

// 检查当前目录是否在Mercurial仓库中
function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true; // 如果是，返回true
  } catch (e) {
    return false; // 如果不是，返回false
  }
}

// 如果不在CI环境中，且没有明确指定运行所有测试，则根据是否在源代码控制下来决定是否观察文件变更
if (
  !process.env.CI &&
  argv.indexOf('--watchAll') === -1 &&
  argv.indexOf('--watchAll=false') === -1
) {
  // 根据是否在Git或Mercurial仓库中来决定添加哪个Jest参数
  const hasSourceControl = isInGitRepository() || isInMercurialRepository();
  argv.push(hasSourceControl ? '--watch' : '--watchAll'); // 如果在源代码控制下，则只在文件改变时运行测试；否则，运行所有测试
}

jest.run(argv); // 使用Jest运行测试，传入处理过的命令行参数
