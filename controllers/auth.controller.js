const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const query = require("../query/query");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const userColl = db.collection("user");
const moment = require("moment");
dotenv.config();
const {
  generatePassword,
  generateOTP,
  sendEmail,
} = require("../helpers/commonfile");
const { ObjectID } = require("mongodb").ObjectID;

const userRegister = async (req, res, next) => {
  try {
    console.log("Create User")
    const requestdata = { emailAddress: req.body.emailAddress };
    const currentDate = moment().format("YYYY-MM-DDThh:mm:ss");

    const userEmail = await query.findOne(userColl, requestdata);
    if (userEmail) {
      const message = `You have already registered with email`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    } else {
      const user = req.body;
      user.status = 0;

      user.password = generatePassword(req.body.password);

      const insertdata = await query.insert(userColl, user);
      if (insertdata.acknowledged) {
        const obj = resPattern.successPattern(
          httpStatus.OK,
          "insertdata",
          `success`
        );
        const otp = generateOTP();

        const toEmail = req.body.emailAddress;
        const emailBody = `<div>OTP: ${otp}</div>`;
        const title = `Account Verification OTP`;

        await sendEmail(toEmail, title, emailBody);

        await query.findOneAndUpdate(userColl, requestdata, {
          $set: {
            otp: otp,
            expireTime: moment()
              .add(10, "Minutes")
              .format("YYYY-MM-DDThh:mm:ss"),
          },
        });

        const toemail = process.env.EMAIL_USER;
        const emailbody = `<div>${user.emailAddress} user is registered. </div>`;
        const Title = `User Registration Mail`;

        await sendEmail(toemail, Title, emailbody);

        return res.status(obj.code).json({
          ...obj,
        });
      } else {
        const message = `Something went wrong, Please try again.`;
        return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
      }
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { password } = req.body;
    const reqData = { emailAddress: req.body.emailAddress };
    // find user
    let user = await query.findOne(userColl, reqData);

    if (!user || user.password == null) {
      const message = `Incorrect email or password.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    const loginData = async () => {
      if (user.status == 0) {
        const currentDate = moment().format("YYYY-MM-DDThh:mm:ssn"); //YYYY-MM-DD[T]HH:mm:ss.SSS[Z]''  YYYY-MM-DDThh:mm:ssn

        delete user["password"];
        let obj = resPattern.successPattern(httpStatus.OK, { user }, "success");
        return res.status(obj.code).json(obj);
      } else {
        const message = `Your Account is not verify.`;
        return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
      }
    };

    if (isMatch) {
      delete user["password"];
      let obj = resPattern.successPattern(httpStatus.OK, { user }, "success");
      return res.status(obj.code).json(obj);
    } else {
      loginData();
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const requestdata = { emailAddress: req.body.emailAddress };
    //find user
    const userData = await query.findOne(userColl, requestdata);
    if (!userData) {
      const message = `Please Enter valid Email`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }

    if (userData) {
      const otp = generateOTP();

      await query.findOneAndUpdate(userColl, requestdata, {
        $set: {
          otp: otp,
          expireTime: moment().add(10, "minutes").format("YYYY-MM-DDThh:mm:ss"),
        },
      });

      const toEmail = req.body.email;
      const emailBody = `<div>OTP: ${otp}</div>`;
      const title = `OTP For ForgotPassword`;

      await sendEmail(toEmail, title, emailBody);

      //send response
      const message = `Email sent successfully.`;
      const obj = resPattern.successMessge(httpStatus.OK, message);
      return res.json({
        ...obj,
      });
    } else {
      const message = `User not found with email: '${userData.emailAddress}.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

module.exports = {
  forgotPassword,
  userRegister,
  userLogin,
};