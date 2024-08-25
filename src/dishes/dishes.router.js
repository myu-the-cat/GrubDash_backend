const router = require("express").Router();

// TODO: Implement the /dishes routes needed to make the tests pass
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// Dishes routes
router.route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed); // .all()で他のメソッドをキャッチ

router.route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed); // .all()で他のメソッドをキャッチ

module.exports = router;
