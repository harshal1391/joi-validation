const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

// bcrypt password
const validPassword = (dbPassword, passwordToMatch) => {
  return bcrypt.compareSync(passwordToMatch, dbPassword);
};

const safeModel = () => {
  return _.omit(this.toObject(), ["password", "__v"]);
};

const generatePassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
function generateOTP() {
  const digits = "123456789";
  let otp = "";
  for (let i = 1; i <= 6; i++) {
    let index = Math.floor(Math.random() * digits.length);
    otp = otp + digits[index];
  }
  return otp;
}
let sendEmail = async (toEmail, subject, bodyHtml, attachments) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    to: toEmail,
    subject: subject,
    html: `${bodyHtml}`,
    attachments: attachments,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  validPassword,
  safeModel,
  generatePassword,
  generateOTP,
  sendEmail,
};
