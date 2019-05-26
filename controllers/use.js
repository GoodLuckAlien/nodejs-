

const User = require('../model/use')
const PromiseA = require('../unit/promiseA')
const jwt = require('jsonwebtoken')
const fs = require('fs')

//获取授权码
exports.getApiCode = function(req,res,next){
   const code = req.query.code
   if(code==='18241891385'){
        res.json({
            code:'0',
            data:{},
        })
   }else{
       next({
           code:'01',
           content:'无效的登陆验证',
       })
   }
}

//注册用户
exports.resgisterUser = function(req,res,next){
       let db = new User({
           username:req.body.username,
           password:req.body.password,
       })
       //验证用户名是否存在
       let promiseA = new PromiseA((resole,reject)=>{
           db.verification(function(err,result){
               err ? reject() : resole(result) 
           })
       })
       promiseA.then(response=>{
         if(response.length===0){
            db.register(function(err,result){
                if(err){
                    //处理错误日志
                    next({ code:'10000',content:"注册失败"  })
                }else{
                   //写入数组库  

                   db.insertUserInformation(result,(err,result)=>{
                        console.log(err,result)
                   })
                  res.json({
                   code:'0',
                   data:{},
                  })
                }
             })  
         }else{
            res.json({
                code:'1',
                content:'用户已注册'
            })
         }
       },()=>{
        //处理错误日志
        next({ code:'10000',content:"注册失败"  })
       })
       
}
//验证用户名是否存在
exports.verification = function(req,res,next){
    const username = req.query.username
     let db = new User({
        username,
        password:null,
     }) 
     db.verification(function(err,result){
        if(err){
            next({ code:'10000',content:"注册失败"  })
        }else{
           if(result.length === 0){
                res.json({
                    code:'0',
                    success:true,
                })
           }else{
                res.json({
                    code:'1',
                    content:'用户已注册'
                })
           }
        }
     })
}
//用户登陆 
exports.userLogin = function(req,res,next){
    const { username , password  } = req.body
    if(!username || !password ){
        next({ code:'10000',type:1,content:'参数类型不匹配'  })
    }
    else{
        let db = new User({
            username,
            password,
        })
        let promise = new PromiseA((resole,reject)=>{
            db.userLogin(function(err,result){
                if(err){
                    next({ code:'10000',content:"系统错误，登陆失败"  })
                }else{
                   if( result.length === 0 ){
                       reject()
                   }
                   else{
                       //生成 token 
                       let content = { msg : username }
                       let secretOrPrivateKey = 'zhaolin'
                       let token = jwt.sign(content,secretOrPrivateKey,{
                           expiresIn:60*60*24*7, // 七天有效期
                       })
                       resole(token)
                   }  
                }
            })
        })
        promise.then((response)=>{
            //插入token
           db.insertToken(response,function(err,result){
                if(err){
                    next({ code:"10000",content:'无效的token插入'  })
                }else{
                    res.json({
                        code:'0',
                        token:response,
                    })
                }
           })
         },()=>{
             res.json({
                 code:'1',
                 content:'用户名或密码错误',
             })
         })
    }
}
//上传头像
exports.uploadImg = function(req,res,next){
    const token = req.get('Authorization')
    //解析token 
    const result = jwt.verify(token,'zhaolin')
    //保存图片路径
    if(result.msg){  
        const imgName = req.file.originalname.split('.')
        const ext = imgName[ imgName.length - 1 ]
        if(ext!=='jpg' && ext!=='png' ){
            res.json({
                code:'10000',
                content:'文件格式错误',
            })
        }
        const savePath = 'http://local.beautfull.zhaolin:8080/static/img/'+result.msg+'.'+ext
        User.uploadHeadImg(result.msg,savePath,(err,r)=>{
            if(err){
                //删除文件
                fs.unlinkSync(req.file.path)
            }else{
                res.json({
                    code:'0',
                    content:'头像上传成功',
                })
                //删除之前得文件
                const extArr = ['jpg','png']
                extArr.forEach(i=>{
                  let status = fs.existsSync('static/img/'+result.msg+'.'+i)   
                  if(status){
                    fs.unlinkSync('static/img/'+result.msg+'.'+i)
                  }
                })
                fs.renameSync(req.file.path,'static/img/'+result.msg+'.'+ext)
            }
        })
    }
    else{
        res.json({
            code:'10000',
            content:'token已经过期，请重新登陆',
        })
    }
}