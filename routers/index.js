//路由配置
'use strict'

const express = require('express')
const router =express.Router()
const handerUser = require('../controllers/use')


router.get('/getApiCode',handerUser.getApiCode)

router.post('/resgister',handerUser.resgisterUser)

router.get('/verification',handerUser.verification)

router.post('/login',handerUser.userLogin)

module.exports = router