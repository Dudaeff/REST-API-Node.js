const { isValidObjectId } = require("mongoose");
const { HttpError } = require("../helpers");

const isValidId = (req, res, next) => {
  if (!isValidObjectId(req.params.contactId)) {
    return next(HttpError(400, `${req.params.contactId} is not valid id`));
  }
  return next();
};

module.exports = isValidId;
