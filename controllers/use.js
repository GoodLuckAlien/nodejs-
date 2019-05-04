
exports.getApiCode = function(req,res,next){
   const code = req.query.code
   console.log(code)
   if(code==='18241891385'){
       console.log(555)
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