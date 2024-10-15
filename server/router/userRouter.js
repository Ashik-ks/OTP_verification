const express = require("express")
const router = express.Router();
const userController = require('../controller/userController');
const accessControl = require("../utils/access-control").accessControl

function setAccessControl(access_types) {

    return(req,res,next) => {
        accessControl(access_types,req,res,next);
    }
}


router.get('/users',setAccessControl("*"),userController.GetAlluser);


module.exports = router