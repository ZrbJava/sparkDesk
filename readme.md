# 项目接入星火认知大模型 demo

## 导言

> 随着国内的语言大模型不断兴起，科大讯飞的星火大模型，阿里的通义千问，百度的文心一言等。
>
> 这些大模型给我提供了很好的便利
>
> 同时星火大模型提供了 **开放 api 功能** 使得我们能够将大模型接入到我们自己的项目当中。
>
> 这使得该项目的产生

## 项目介绍

我通过星火大模型提供的开放 api，将大模型成功接入到自己网页中

## 运行项目

- 下载该项目

- 到讯飞开发平台注册账户，这样可以添加应用

  - [讯飞开放平台-以语音交互为核心的人工智能开放平台 (xfyun.cn)](https://www.xfyun.cn/)

- 到讯飞控制台添加一个应用，这样可以获取 APPID，APISecret，APIKey 等

  - [控制台-讯飞开放平台 (xfyun.cn)](https://console.xfyun.cn/app/myapp)

- 打开我们项目

  - 修改 index.js 中的代码，填写自己的 APPID，APISecret，APIKey

    ```
    	let requestObj = {
    	    APPID: '',
    	    APISecret: '',
    	    APIKey: '',
    	    Uid:"随机用户名",
    	    sparkResult: ''
    	}
    ```

- 然后执行下面指令

  ```shell
    pnpm i
    pnpm run dev
  ```

## 结尾

很久前我就开始研究如何接入各家大模型，但是人家还没有开放 api 出来，星火大模型是最先出的，太棒了！！
觉得不错的请三连支持一下！！！tk
