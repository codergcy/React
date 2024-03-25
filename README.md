# 学习React
###  使用 create-react-app 构建React工程化项目
安装create-react-app
- npm i create-react-app -g 「mac需要加sudo」

基于脚手架创建项目「项目名称需要符合npm包规范」
- create-react-app xxx
![alt text](image.png)
package.json
![alt text](image-1.png)
默认情况下，会把webpack配置项隐藏到node_modules中，如果想修改，则需要暴露配置项：
- yarn eject
![alt text](image-2.png)
真实项目中常用的一些修改操作
- 配置less
![alt text](image-3.png)
- 配置别名
![alt text](image-7.png)
- 配置预览域名
![alt text](image-6.png)
- 配置跨域代理
![alt text](image-5.png)
- 配置浏览器兼容
![alt text](image-4.png)