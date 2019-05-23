//路由配置
'use strict'

const express = require('express')
const router =express.Router()
const multer = require('multer')
const handerUser = require('../controllers/use')

const loader = multer({ dest:'static/img/' })

router.get('/getApiCode',handerUser.getApiCode)

router.post('/resgister',handerUser.resgisterUser)

router.get('/verification',handerUser.verification)

router.post('/login',handerUser.userLogin)

router.post('/uploadImg', loader.single('myImg') ,handerUser.uploadImg)

module.exports = router