export default function errorMiddleware(error, req, res, next) {
    console.log(error)
  
    res.status(error.code || 500)
      .json({
        status: 'error',
        code: error.code || 500,
        message: "Something went wrong"
        // message: error.message,
        // trace: error.trace,
        // details: error.details,
      })
  }