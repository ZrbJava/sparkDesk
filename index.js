import * as base64 from 'base-64'
import CryptoJs from 'crypto-js'
// import marked from 'marked'
import { marked } from 'marked';
import hljs from 'highlight.js';
// import 'highlight.js/styles/dark.min.css';
// import 'highlight.js/styles/vs.min.css'
import 'highlight.js/styles/atom-one-dark.min.css'
import ClipboardJS from 'clipboard'


import { createApp, ref, computed, nextTick, onMounted } from 'vue/dist/vue.esm-bundler.js'
createApp({
  setup (props) {
    const resultRef = ref(null)
    const questionInput = ref('')
    let requestObj = {
      APPID: 'f610cb14',
      APISecret: 'ZmQ2ZjQwNTk4ZDE4NDYyNGQ3MWNmYmM4',
      APIKey: 'd7e0b1c7b3f70dbf4bfe12036772d596',
      Uid: 'zhaorubo',
      sparkResult: '',
    }
    const formattedContent = (msg) => {
      // 使用 marked 将原始内容转换为 HTML
      const html = marked(msg);

      // 创建一个新的 div 元素，并将 html 字符串设置为其 innerHTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      nextTick(() => {
        resultRef.value.scrollTop = resultRef.value.scrollHeight
      })

      // 使用 highlight.js 对代码块进行语法高亮
      const blocks = tempDiv.querySelectorAll('pre code');
      blocks.forEach((block) => {
        hljs.highlightBlock(block);
        // 创建复制按钮
        const codeHeader = document.createElement('div');
        codeHeader.style = 'display:flex;justify-content:space-between;align-items:center;background:#2f2f2f;color:#b4b4b4;padding:10px;border-top-left-radius:8px;border-top-right-radius:8px'
        codeHeader.innerHTML = `
        <span>${block.result.language}</span>
        <div class="copy-button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path></svg> 复制</div>
        `

        // 插入复制按钮到代码块上方
        block.parentNode.insertBefore(codeHeader, block.parentNode.firstChild);

        setTimeout(() => {
          console.log(document.querySelector('.copy-button'))
          let copyButtons = document.querySelectorAll('.copy-button');
          copyButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
              const copyedText = '✅ 已复制'
              const originInterText = e.target.innerHTML
              if (copyedText === originInterText) return
              e.target.innerHTML = copyedText
              setTimeout(() => {
                e.target.innerHTML = originInterText
              }, 2000);
              console.dir(e.target.parentElement.nextSibling.textContent)
              ClipboardJS.copy(e.target.parentElement.nextSibling.textContent || '')
            });
          })
        }, 0);
      });

      return tempDiv.innerHTML;

    }

    // 发送消息
    const sendMsg = async () => {
      // 获取请求地址
      let myUrl = await getWebsocketUrl()
      // 获取输入框中的内容
      let inputVal = questionInput.value
      // 每次发送问题 都是一个新的websocketqingqiu
      let socket = new WebSocket(myUrl)
      qalist.value.push({
        role: 'user',
        content: inputVal
      })
      // 监听websocket的各阶段事件 并做相应处理
      socket.addEventListener('open', event => {
        questionInput.value = ''
        console.log('开启连接！！', event)
        // 发送消息
        let params = {
          header: {
            app_id: requestObj.APPID,
            uid: requestObj.Uid,
          },
          parameter: {
            chat: {
              domain: 'generalv3.5',
              temperature: 0.5,
              max_tokens: 1024,
            },
          },
          payload: {
            message: {
              // 如果想获取结合上下文的回答，需要开发者每次将历史问答信息一起传给服务端，如下示例
              // 注意：text里面的所有content内容加一起的tokens需要控制在8192以内，开发者如有较长对话需求，需要适当裁剪历史信息
              text: [
                { role: 'user', content: '你是谁' }, //# 用户的历史问题
                { role: 'assistant', content: '我是AI助手' }, //# AI的历史回答结果
                // ....... 省略的历史对话
                { role: 'user', content: inputVal }, //# 最新的一条问题，如无需上下文，可只传最新一条问题
              ],
            },
          },
        }
        console.log('发送消息')
        socket.send(JSON.stringify(params))
      })
      socket.addEventListener('message', event => {
        if (!requestObj.sparkResult) {
          qalist.value.push({
            role: 'assistant',
            content: ''
          })
        }
        let data = JSON.parse(event.data)
        console.log('收到消息！！', data)
        requestObj.sparkResult += data.payload.choices.text[0].content
        if (data.header.code !== 0) {
          // console.log(
          //   '出错了',
          //   data.header.code,
          //   ':',
          //   data.header.message
          // )
          // 出错了"手动关闭连接"
          socket.close()
        }
        if (data.header.code === 0) {
          // 对话已经完成
          if (data.payload.choices.text && data.header.status === 2) {
            requestObj.sparkResult += data.payload.choices.text[0].content
            console.log(qalist.value)
            setTimeout(() => {
              // "对话完成，手动关闭连接"
              socket.close()
            }, 1000)
          }
        }
        console.log('requestObj.sparkResult', requestObj.sparkResult)
        qalist.value[qalist.value.length - 1].content = formattedContent(requestObj.sparkResult)
        console.log(22222, qalist.value[qalist.value.length - 1].content)

      })
      socket.addEventListener('close', event => {
        console.log('连接关闭！！', event)
        requestObj.sparkResult = ''

      })
      socket.addEventListener('error', event => {
        console.log('连接发送错误！！', event)
      })
    }
    // 鉴权url地址
    const getWebsocketUrl = () => {
      return new Promise((resovle, reject) => {
        let url = 'wss://spark-api.xf-yun.com/v3.5/chat'
        let host = 'spark-api.xf-yun.com'
        let apiKeyName = 'api_key'
        let date = new Date().toGMTString()
        let algorithm = 'hmac-sha256'
        let headers = 'host date request-line'
        let signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v3.5/chat HTTP/1.1`
        let signatureSha = CryptoJs.HmacSHA256(
          signatureOrigin,
          requestObj.APISecret
        )
        let signature = CryptoJs.enc.Base64.stringify(signatureSha)

        let authorizationOrigin = `${apiKeyName}="${requestObj.APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`

        let authorization = base64.encode(authorizationOrigin)

        // 将空格编码
        url = `${url}?authorization=${authorization}&date=${encodeURI(
          date
        )}&host=${host}`

        resovle(url)
      })
    }
    const qalist = ref([])

    return {
      sendMsg,
      questionInput,
      formattedContent,
      resultRef,
      qalist
    }
  },
}).mount('#app')