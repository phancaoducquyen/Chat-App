export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Không tìm thấy đường dẫn: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Lỗi server",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};
