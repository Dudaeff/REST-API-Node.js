const express = require("express");

const { isValidId } = require("../../middlewares");

const router = express.Router();

const { contactsController } = require("../../controllers");

router.get("/", contactsController.getAll);

router.get("/:contactId", isValidId, contactsController.getById);

router.post("/", contactsController.addNewContact);

router.delete("/:contactId", isValidId, contactsController.removeById);

router.put("/:contactId", isValidId, contactsController.updateById);

router.patch(
  "/:contactId/favorite",
  isValidId,
  contactsController.updateStatusContact
);

module.exports = router;
