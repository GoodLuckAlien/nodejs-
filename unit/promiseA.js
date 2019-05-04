'use strict '
//  promiseA+ 规范
 /**
   * 
   * @param { Function } actuator promise回调函数
   * @constructor 构造函数
   * @author zhaolin
   */

function PromiseA (actuator){
    let self = this
    self.status = 'pedding'
    self.value = undefined
    self.reason = undefined 
    self.resolveStorage = [] //储存所有 resolve状态
    self.rejectStorage = []  //储存所有 reject 状态
    function resolve (value){
      if(self.status === 'pedding'){
        self.value = value 
        self.status = 'resolve'
        self.resolveStorage.forEach(i=>{
            i(self.value)
        })
      }
    }

    function reject (reason){
      if(self.status === 'pedding'){
        self.reason = reason
        self.status = 'reject'
        self.rejectStorage.forEach(i=>{
            i(self.reason)
        })
      }
    }
    try{
      actuator( resolve , reject )
    }catch(e){
      reject(e)
    }
}
// 强类型判断
function isType (val){
    return Object.prototype.toString.call(val).slice(8,-1)
}
    /**
   * @param  promise2 源promise
   * @param  x  返回promise 方法或者函数
   * @param  resolve 成功时候执行函数
   * @param  reject  失败时候执行函数
   */
function resolveIsPromise (promise2,x,resolve,reject){
   if(promise2===x){
       reject( new TypeError('循环引用同一promise') )
   }
   let errStatus
   let Promisetype = isType( x )
  
   if(Promisetype !== 'Null' && ( Promisetype === 'Function' || Promisetype === 'Object'  )  ){
       let then = x.then
       try{
       
           if(isType(then) === 'Function'){
              then.call(x,function(val){
                  if(errStatus) return
                  errStatus = true
                  resolveIsPromise(promise2,val,resolve,reject)
              }
              ,function(err){
                 if(errStatus) return
                 errStatus = true
                 reject(err)
              })
           }else{
               resolve(then)
           }
       }
       catch(e){
           if(errStatus) return
           errStatus = true
           reject(e)
       }
   }else{
       resolve(x)
   }
}
    /**
     * promise then 方法
     * @param onResolve 成功是调用函数
     * @param onReject  失败时候调用函数
     */


PromiseA.prototype.then=function(onResolve,onReject){
    let self = this
    let newPromise
    if(self.status==='reject'){
        newPromise = new PromiseA((resolve, reject)=>{
           try{
              let rej =  onReject(self.reason) 
              resolveIsPromise(newPromise,rej,resolve,reject)
           }
           catch(e){
              reject(e)
           }
        })
    }
    else if(self.status === 'resolve' ){
        newPromise = new PromiseA((resolve,reject)=>{
            try{
                let res = onResolve(self.value)
                resolveIsPromise(newPromise,res,resolve,reject)
            }
            catch(e){
                reject(e)
            }
        })
    }
    else if(self.status === 'pedding'){
        newPromise = new PromiseA((resolve,reject)=>{
            self.resolveStorage.push(function(val){
                try{
                    let res =  onResolve(val) 
                    resolveIsPromise(newPromise,res,resolve,reject)
                 }
                 catch(e){
                    reject(e)
                 }
            })
            self.rejectStorage.push(function(val){
                try{
                    let rej = onReject(val)
                    resolveIsPromise(newPromise,rej,resolve,reject)
                }
                catch(e){
                    reject(e)
                }  
            })
        })
    }
    return newPromise
}

   /**  resolve 方法
   * @param onResolve 成功时调用函数
   */
PromiseA.resolve = function(onResolve){
    return new PromiseA((resolve)=>{
          resolve(onResolve)
    })
}


   /**  reject 方法
   * @param onReject 失败时调用函数
   */
PromiseA.reject = function (onReject){
    return new PromiseA((resolve,reject)=>{
          reject(onReject)
    })
}


   /** promise all 方法
   * @param promiseArr promise 参数数组
   */
PromiseA.all = function(promiseArr){
    if(isType(promiseArr) !== 'Array' ){
        throw new TypeError('promise all 方法 参数应该为数组')
    }
    return new PromiseA(function(resolve,reject){
        try{
           let resolveArr = [] //创造数组接受promise参数
           let count = 1 //记录数量
           promiseArr.forEach(item=>{
                item.then(res=>{
                    resolveArr.push(res)
                    if(count === promiseArr.length) resolve(resolveArr)     
                    count++
                })
           })

        }
        catch(e){
            reject(e)
        }
    })
}
   /** promise race 方法
   * @param promiseArr promise参数数组
   */
PromiseA.race = function(promiseArr){
    if(isType(promiseArr) !== 'Array' ){
        throw new TypeError('promise all 方法 参数应该为数组')
    }
    return new PromiseA((resolve,reject)=>{
        try{
           promiseArr.forEach(item=>{
               item.then(resolve,reject)
           })
        }
        catch(e){
           reject(e)
        }
    })
}



module.exports = PromiseA