function errorMiddleware(error, req, res, next) {
  console.log(error);
  res.status(error.code || 500).json({
    status: "error",
    code: error.code || 500,
    message: error.message || "Something went wrong",
  });
}

export {errorMiddleware}