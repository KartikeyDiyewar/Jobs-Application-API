//const { CustomAPIError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
  const customErr = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, please try again later",
  };
  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message });
  // }
  if (err.name === "ValidationError") {
    customErr.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customErr.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === "CastError") {
    customErr.msg = `No job found with id:${err.value}`;
    customErr.statusCode = StatusCodes.NOT_FOUND;
  }

  if (err.code && err.code === 11000) {
    customErr.msg = `${Object.keys(
      err.keyValue
    )} already exists, please login or register with new ${Object.keys(
      err.keyValue
    )}`;
    customErr.statusCode = StatusCodes.BAD_REQUEST;
  }

  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  return res.status(customErr.statusCode).json({ msg: customErr.msg });
};

module.exports = errorHandlerMiddleware;
