const { HttpError } = require("../helpers");
const { ctrlWrapper } = require("../decorators");
const { Contact } = require("../models/contact");
const { schemas } = require("../models/contact");

const getAll = async (_, res) => {
  const result = await Contact.find();
  res.json(result);
};

const getById = async (req, res) => {
  const { contactId } = req.params;

  const result = await Contact.findById(contactId);

  if (!result) throw HttpError(404);

  res.json(result);
};

const addNewContact = async (req, res) => {
  const { error } = schemas.addContact.validate(req.body);

  if (error) throw HttpError(400, "missing required name field");

  const result = await Contact.create(req.body);

  res.status(201).json(result);
};

const removeById = async (req, res) => {
  const { contactId } = req.params;

  const result = await Contact.findByIdAndRemove(contactId);

  if (!result) throw HttpError(404);

  res.json({ message: "contact deleted" });
};

const updateById = async (req, res) => {
  const { contactId } = req.params;

  const { error } = schemas.updateContact.validate(req.body);

  if (error) throw HttpError(400, "missing required name field");

  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) throw HttpError(404);

  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { contactId } = req.params;

  const { error } = schemas.updateFavorite.validate(req.body);

  if (error) throw HttpError(400, "missing required name field");

  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) throw HttpError(404);

  res.json(result);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  addNewContact: ctrlWrapper(addNewContact),
  removeById: ctrlWrapper(removeById),
  updateById: ctrlWrapper(updateById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
