
"use strict"

const mysql = require('mysql')
const fs = require('fs')

//配置数据库

let config = {
    connectionLimit : 500,
    host : 'localhost',
    database : 'nodejs_project',
    user : 'root',
    password : 'root'
}

// 创建一个数据库连接池
let pool = mysql.createPool(config)

/**
 * 用于执行数据库的SQL语句
 * @param sql
 * @param p
 * @param c
 */

exports.query = function(sql , p ,c){
    
     //参数匹配
     let params = []
     let callback
     // 开始进行参数的匹配

     if (arguments.length === 2 && typeof arguments[1] === 'function') {
         // 两个参数的话，第一个参数是SQL语句，第二个参数是回调函数
         callback = p
     } else if (arguments.length === 3 && Array.isArray(p) && typeof arguments[2] === 'function') {
         params = p
         callback = c
     } else {
         throw new Error('Sorry, 参数个数不匹配或参数类型错误！');
     }

     //从数据库连接池中取出连接
     pool.getConnection(function( err , connect ){
         
         connect.query(sql,params,function(err, val){

            connect.release()

            callback.apply(null,arguments)
         })
     })


}