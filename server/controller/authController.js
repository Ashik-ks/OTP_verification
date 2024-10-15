let users = require('../db/model/model');
const success_function = require('../utils/responsehandler').success_function;
const error_function = require('../utils/responsehandler').error_function;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const set_password_template =
  require("../utils/email-templates/set-password").resetPassword;
const sendEmail = require("../utils/send-email").sendEmail;



exports.signup = async function (req, res) {
  try {

    let body = req.body;
    console.log("body : ", body);

    let email = body.email;
    console.log("email : ", email);

    function generateOTP(length) {
      let digits = '0123456789';
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
      }
      return otp;
    }

    let otpLength = 6;
    let otp = generateOTP(otpLength);
    console.log("otp : ", otp);

    // let email_template = await set_password_template(body.name, body.email, otp)
    // await sendEmail(body.email, "User created", email_template);

    let otptoken = jwt.sign({ otp, email }, process.env.PRIVATE_KEY, { expiresIn: "10m" });
    console.log("otptoken : ", otptoken);

    let response_data = {
      otptoken,
      body
    }

    let response = success_function({
      statusCode: 200,
      data: response_data,
      message: "Otp send successful",
    });

    res.status(response.statuscode).send(response);
    return;

  } catch (error) {

    console.error("Error: ", error);
    let response = {
      success: false,
      statuscode: 400,
      message: "Something went wrong",
    };
    res.status(response.statuscode).send(response);

  }
}

exports.verifyOTP = async function (req, res) {
  try {
    const authHeader = req.headers["authorization"];
    console.log("authHeader:", authHeader);

    if (!authHeader) {
      return res.status(401).send({
        success: false,
        statuscode: 401,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(' ')[1];
    console.log("token:", token);

    const bodyOtp = req.body.otp; // Ensure you're accessing the body correctly

    jwt.verify(token, process.env.PRIVATE_KEY, async (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).send({
          success: false,
          statuscode: 401,
          message: "Invalid token",
        });
      }

      const decodedOtp = decoded.otp; // Rename for clarity
      console.log("decoded OTP:", decodedOtp);

      let salt = bcrypt.genSaltSync(10);
      console.log("salt : ", salt);

      let hashedpassword = bcrypt.hashSync(req.body.password, salt)
      console.log("hashedpassword : ", hashedpassword);

      // Validate the OTP
      if (bodyOtp === decodedOtp) {
        const newUser = {
          name: req.body.name,
          email: req.body.email,
          password: hashedpassword,
        };

        // Create user in the database
        const addUser = await users.create(newUser);

        return res.status(200).send({
          success: true,
          statuscode: 200,
          message: "User added successfully",
        });
      } else {
        return res.status(400).send({
          success: false,
          statuscode: 400,
          message: "Invalid OTP",
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      success: false,
      statuscode: 500,
      message: "An error occurred during verification",
    });
  }
};

