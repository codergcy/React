'use strict'; // 使用严格模式

// 设置环境变量，以便任何读取它的代码知道正确的环境
process.env.BABEL_ENV = 'development'; // 设置Babel的环境变量为开发模式
process.env.NODE_ENV = 'development'; // 设置Node的环境变量为开发模式

// 如果有未处理的Promise拒绝，则使脚本崩溃，而不是默默地忽略它们。未来，未处理的promise拒绝将会导致Node.js进程以非零退出码终止。
process.on('unhandledRejection', err => {
  throw err; // 抛出错误
});

// 确保读取环境变量
require('../config/env');

// 引入所需模块
const fs = require('fs'); // 文件系统模块，用于文件操作
const chalk = require('react-dev-utils/chalk'); // 用于在控制台中输出彩色文本
const webpack = require('webpack'); // 引入webpack
const WebpackDevServer = require('webpack-dev-server'); // 引入WebpackDevServer
const clearConsole = require('react-dev-utils/clearConsole'); // 清除控制台
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles'); // 检查必需文件
const { // 引入工具函数
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser'); // 在浏览器中打开URL
const semver = require('semver'); // 用于处理版本号
const paths = require('../config/paths'); // 引入路径配置
const configFactory = require('../config/webpack.config'); // 引入webpack配置工厂函数
const createDevServerConfig = require('../config/webpackDevServer.config'); // 引入开发服务器配置创建函数
const getClientEnvironment = require('../config/env'); // 获取客户端环境变量的函数
const react = require(require.resolve('react', { paths: [paths.appPath] })); // 动态引入react

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1)); // 获取环境变量
const useYarn = fs.existsSync(paths.yarnLockFile); // 检查是否使用Yarn
const isInteractive = process.stdout.isTTY; // 检查是否在交互式终端中运行

// 如果缺少必需的文件，则警告并终止
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1); // 退出程序
}

// Cloud9等工具依赖于此环境变量
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000; // 设置默认端口
const HOST = process.env.HOST || '127.0.0.1'; // 设置默认主机名

// 如果设置了HOST环境变量，则尝试绑定到该变量指定的主机
if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`
  );
  console.log();
}
// 我们要求您明确设置浏览器，而不是回退到browserslist的默认值。
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // 我们尝试使用默认端口，但如果它被占用，我们将提供给用户在不同端口上运行的选项。`choosePort()` Promise解析为下一个空闲端口。
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(port => {
    if (port == null) {
      // 我们没有找到可用的端口。
      return;
    }

    const config = configFactory('development'); // 根据开发环境生成Webpack配置
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'; // 确定协议是https还是http
    const appName = require(paths.appPackageJson).name; // 获取应用程序的名称

    const useTypeScript = fs.existsSync(paths.appTsConfig); // 检查是否使用TypeScript
    const urls = prepareUrls(protocol, HOST, port, paths.publicUrlOrPath.slice(0, -1)); // 准备URLs用于后续使用
    // 使用自定义消息配置创建一个webpack编译器。
    const compiler = createCompiler({appName, config, urls, useYarn, useTypeScript, webpack});
    // 加载代理配置
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic, paths.publicUrlOrPath);
    // 通过Web服务器提供编译器生成的webpack资源。
    const serverConfig = {...createDevServerConfig(proxyConfig, urls.lanUrlForConfig), host: HOST, port};
    const devServer = new WebpackDevServer(serverConfig, compiler);
    // 启动WebpackDevServer。
    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole(); // 如果是交互模式，则清空控制台
      }

      // 检查Fast Refresh兼容性（需要React 16.10或更高版本）
      if (env.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
        console.log(chalk.yellow(`Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`));
      }

      console.log(chalk.cyan('Starting the development server...\n')); // 打印开始开发服务器的信息
      openBrowser(urls.localUrlForBrowser); // 在浏览器中打开应用
    });

    // 监听SIGINT和SIGTERM信号，以便优雅地关闭开发服务器。
    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        process.exit();
      });
    });

    if (process.env.CI !== 'true') {
      // 当stdin结束时优雅退出
      process.stdin.on('end', function () {
        devServer.close();
        process.exit();
      });
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message); // 打印错误消息
    }
    process.exit(1); // 发生错误时退出进程
  });
