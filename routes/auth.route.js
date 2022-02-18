const router = require("express").Router();
const authCtrl = require("../controllers/auth.controller");
const { validate } = require("../helpers/validation.helpers");
const { userParamsValidation } = require("../helpers/joi.validation");

router
  .route("/forgotPassword")
  .post( authCtrl.forgotPassword);

router
  .route("/create-user")
  .post(validate(userParamsValidation.createUser), authCtrl.userRegister);

router.route("/login").post(authCtrl.userLogin);

module.exports = router;