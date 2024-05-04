module.exports = (asyncHandler) => {
  return (req, res, next) => {
    asyncHandler(req, res, next).catch(next);
  };
};
