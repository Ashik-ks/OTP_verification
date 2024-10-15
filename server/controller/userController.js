let users = require('../db/model/model');
const { success_function, error_function } = require('../utils/responsehandler');
const bcrypt = require('bcrypt');
const path = require('path');


exports.GetAlluser = async function (req, res) {
    try {
        let user = await users.find();
        console.log("user : ",user);

        let response = success_function({
            statuscode: 200,
            message: "Users fetched successfully",
            data : user
        })
        res.status(response.statuscode).send(response);
        return;

    } catch (error) {
        
        let response = error_function({
            statuscode: 400,
            message: "user created failed"
        })
        res.status(response.statuscode).send(response);
        return;
    }
};