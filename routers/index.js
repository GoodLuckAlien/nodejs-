//路由配置
'use strict'

const express = require('express')
const router =express.Router()

const handerUser = require('../controllers/use')

router.get('/getApiCode',handerUser.getApiCode)

module.exports = router