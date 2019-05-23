
const db = require('./db')
/**
 * 定义用户名类
 * @param User
 * @constructor
 */

function User (User){
   this.username = User.username
   this.password = User.password
}
//注册用户
User.prototype.register = function(callback){
     db.query('insert into user(username,password) values( ? , ?  )',[this.username,this.password],function(err,result){
         if(err){
             console.log(err)
             callback(err,null)
         }
         else{
             callback(null,result)
         }
     })
}
//手机号注册验证 
User.prototype.verification = function(callback){
    db.query('select * from user where username = ?' , [ this.username ] , function(err,result){
        if(err){
            callback(err,null)
        }
        else{
            callback(null,result)
        }
    })
}
//用户登陆
User.prototype.userLogin = function(callback){
    db.query('select * from user where username = ? and password = ? ',[ this.username , this.password ],function(err,result){
       if(err){
           callback(err,null)
       }else{
           callback(null,result)
       }
    })
}
//插入token
User.prototype.insertToken = function(token,callback){
   db.query('update user set token = ? where username =  ?' ,[ token , this.username  ] , function(err,result){
        if(err){
            callback(err,null)
        }else{
            callback(null,result)
        }
   }) 
}

module.exports = User