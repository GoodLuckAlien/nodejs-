//处理错误信息
module.exports = function(err,req,res,next){
    console.log(err) // 处理响应错误信息
    const {  code , content   } = err
      if(code){
        res.json({
            code,
            content,
        })
      }else{
        res.send('500, Interal Server Error'+ err)
      }

}