const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo && deliverTo !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}

function hasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber && mobileNumber !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}

function hasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (!dishes) {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
    x;
  } else if (
    (Array.isArray(dishes) && dishes.length <= 0) ||
    !Array.isArray(dishes)
  ) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  next();
}

function hasQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const allQuantitiesAreGreaterThanZero = dishes.every(
    (dish) => dish.quantity > 0
  );
  const allQuantitiesAreNumbers = dishes.every((dish) =>
    Number.isInteger(dish.quantity)
  );

  if (allQuantitiesAreNumbers && allQuantitiesAreGreaterThanZero) {
    return next();
  } else if (!allQuantitiesAreNumbers) {
    return next({
      status: 400,
      message: `dish ${dishes.findIndex(
        (dish) => !Number.isInteger(dish.quantity)
      )} must have a quantity that is an integer greater than 0`,
    });
  }
  next({
    status: 400,
    message: `dish ${dishes.findIndex(
      (dish) => dish.quantity <= 0
    )} must have a quantity that is an integer greater than 0`,
  });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function list(req, res) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function orderIdMatchesRouteId(req, res, next) {
  const orderId = req.params.orderId;

  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }
  next();
}

function hasStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];
  if (status && validStatuses.indexOf(status) >= 0) {
    return next();
  }
  next({
    status: 400,
    message:
      "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
}

function orderIsNotDelivered(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }
  next();
}

function update(req, res) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  res.locals.order.deliverTo = deliverTo;
  res.locals.order.mobileNumber = mobileNumber;
  res.locals.order.status = status;
  res.locals.order.dishes = dishes;

  res.json({ data: res.locals.order });
}

function orderIsPending(req, res, next) {
  if (res.locals.order && res.locals.order.status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending.",
  });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

module.exports = {
  create: [hasDeliverTo, hasMobileNumber, hasDishes, hasQuantity, create],
  list,
  read: [orderExists, read],
  update: [
    orderExists,
    hasDeliverTo,
    hasMobileNumber,
    hasDishes,
    hasQuantity,
    orderIdMatchesRouteId,
    orderIsNotDelivered,
    hasStatus,
    update,
  ],
  delete: [orderExists, orderIsPending, destroy],
};