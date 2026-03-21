const express = require("express");
const vaccines = require("../controllers/vaccine.controller");

const router = express.Router();

router.route("/")
    .get(vaccines.findAll)
    .post(vaccines.create);

router.route("/:id")
    .put(vaccines.update)
    .delete(vaccines.delete);

module.exports = router;