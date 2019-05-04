'use strict'
const PromiseA = require('./unit/promiseA') // 
const express=require('express')
const app = express()
const server = require('http').createServer(app)
const bodyParse = require('body-parser')
const router = require('./routers')
const config = require('./config')
const err = require('./controllers/err')



//配置静态资源中间服务
app.use(express.static('static'))

//配置post请求体解析中间件 
app.use(bodyParse.urlencoded({ extended:false }))

//配置文件中的加密信息
app.locals.config = config

//路由中间件
app.use(router)

//配置相应头中间件
app.use(function(req,res,next){
    res.writeHead(200,{ // 配置响应头
     'content-type':'text/html;charset=utf-8',
     'Access-Control-Allow-Origin':'*',
     "Access-Control-Allow-Credentials": "true"    
    })
    next()
 })

//最后一个中间件， 处理错误信息
if(config.isDebug){
   app.use(err) //处理错误信息 错误类型 请求错误 ，服务器错误
}else{
    //记录日log4日志
}

server.listen(8080,'127.0.0.2')

