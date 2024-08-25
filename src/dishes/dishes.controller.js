const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name && name !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description && description !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}

function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) {
    return next({
      status: 400,
      message: "Dish must include a price",
    });
  } else if (
    !Number.isInteger(price) ||
    (Number.isInteger(price) && price <= 0)
  ) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  next();
}

function hasImageUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function dishIdMatchesRouteId(req, res, next) {
  const dishId = req.params.dishId;

  const { data: { id, name, description, image_url, price } = {} } = req.body;
  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  next();
}

function update(req, res) {
  const { data: { id, name, description, image_url, price } = {} } = req.body;

  res.locals.dish.name = name;
  res.locals.dish.description = description;
  res.locals.dish.image_url = image_url;
  res.locals.dish.price = price;

  res.json({ data: res.locals.dish });
}

module.exports = {
  create: [hasName, hasDescription, hasPrice, hasImageUrl, create],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    hasName,
    hasDescription,
    hasPrice,
    hasImageUrl,
    dishIdMatchesRouteId,
    update,
  ],
};