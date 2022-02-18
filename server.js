const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const db = require("./config/database");
const APIError = require("./helpers/APIError");
const httpStatus = require("http-status");
const expressValidation = require("express-validation");
const path = require("path");

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({ limit: "15gb", extended: true }));
app.use(bodyParser.json({ limit: "15gb" }));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "Dummy",
    resave: true,
    saveUninitialized: true,
  })
);

db.connection().then((database) => {
  module.exports = database;

  app.use("/api/auth", require("./routes/auth.route"));

  app.use((err, req, res, next) => {
    if (err instanceof expressValidation.ValidationError) {
      console.log("validation error");
      const unifiedErrorMessage = err.errors
        .map((Error) => Error.messages.join(". "))
        .join(" and ");
      const error = new APIError(unifiedErrorMessage, err.status, true);
      return next(error);
    } else if (!(err instanceof APIError)) {
      const apiError = new APIError(
        err.message,
        err.status,
        err.name === "UnauthorizedError" ? true : err.isPublic
      );
      return next(apiError);
    }
    return next(err);
  });

  app.use((req, res, next) => {
    const err = new APIError("API Not Found", httpStatus.NOT_FOUND, true);
    return next(err);
  });

  app.use((err, req, res, next) => {
    res.status(err.status).json({
      error: {
        message: err.isPublic ? err.message : httpStatus[err.status],
      },
    });
  });
  app.listen(port, () => {
    console.log(`The dummy app is up on port ${port}`);
  });
});
