const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const accessControl = require('../utils/access-control').accessControl

function setAccessControl(access_types) {

    return(req,res,next) => {
        accessControl(access_types,req,res,next);
    }
}
router.post('/signup',setAccessControl("*"),authController.signup);
router.post('/verifyOTP',setAccessControl("*"),authController.verifyOTP);


module.exports = router;