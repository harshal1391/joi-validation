const { Joi } = require("express-validation");

const userParamsValidation = {
  createUser: {
    body: Joi.object({
      name: Joi.string().alphanum().min(6).required(),
      emailAddress: Joi.string()
        .regex(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        .message("Please enter valid email.")
        .required(),
      password: Joi.string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,20})(^\S*$)/
        )
        .message(
          "Please add at least 8 characters and also include at least one uppercase letter, one lowercase letter, a number and a special character."
        )
        .required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
    }),
  },
};

module.exports = {
  userParamsValidation,
};
