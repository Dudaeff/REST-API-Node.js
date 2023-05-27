const express = require("express");

const { isValidId } = require("../../middlewares");

const { contactsController } = require("../../controllers");

const { authenticate } = require("../../middlewares");

const { validateBody } = require("../../helpers");

const { contactSchemas } = require("../../models/contact");

const router = express.Router();

router.use(authenticate);

router.get("/", contactsController.getAll);

router.get("/:contactId", isValidId, contactsController.getById);

router.post(
  "/",
  validateBody(contactSchemas.add),
  contactsController.addNewContact
);

router.delete("/:contactId", isValidId, contactsController.removeById);

router.put(
  "/:contactId",
  isValidId,
  validateBody(contactSchemas.update),
  contactsController.updateById
);

router.patch(
  "/:contactId/favorite",
  isValidId,
  validateBody(contactSchemas.updateFavorite),
  contactsController.updateStatus
);

module.exports = router;
