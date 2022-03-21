const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//list
function list(req, res) {
    res.json({ data: dishes });
  }

//validation 

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === (dishId));
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    });
  };


// function dishHasName(req, res, next) {
//     const { data: { name } = {} } = req.body;
//     if (!name || name === "") {
//         next({
//             status: 400,
//             messsage: "Dish must include a name"
//         });
//     }
    
//     return next();
// }

function dishHasName(request, response, next) {
    const {
      data: { name },
    } = request.body;
  
    if (!name || name === "") {
      next({
        status: 400,
        message: "Dish must include a name",
      });
    }
  
    response.locals.name = name;
    next();
  }

function dishHasDescription(req, res, next){
    const {data: {description} = {} } = req.body;
    if(!description || description === ""){
        next({
            status: 400,
            message: "Dish must include a description"
        })
    }
    return next()
}

function dishHasPrice(req, res, next){
    const { data: {price} = {} } = req.body;
    if(!price){
        next({
            status: 400,
            message: "Dish must include a price"
        })
    }
    return next()
}

function priceIsGreaterThanZero(req, res, next){
    const {data: {price} = {} } = req.body;
    if(price <= 0){
        next({
            status: 400,
            message:"Dish must have a price that is an integer greater than 0"
        })
    }
    return next()
}

function priceIsNum(req, res, next){
    const {data: {price} = {}} = req.body
    if(Number.isInteger(price)){
        return next();
    }
    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0"
    })
}

function dishHasImage(req, res, next){
    const {data: {image_url} = {} } = req.body;
    if(!image_url || image_url === ""){
        next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
    return next()
}

//find id validation

  function dishIdMatches(req, res, next){
    const {dishId} = req.params
    const {data: {id} = {}} = req.body
    if(dishId === id || !id){
        return next();
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}.`
    })
}


//create
function create(req, res){
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}


//read
function read(req, res){
    res.json({ data: res.locals.dish });
}


//update
function update(req, res){
    const dish = res.locals.dish;
    const originalName = dish.name;
    const originalDescription = dish.description;
    const originalPrice = dish.price;
    const originalImage = dish.image_url;
    const { data: { name, description, price, image_url } = {} } = req.body;

    if (originalName !== name) {
        // Update the dish
        dish.name = name
    }
    if (originalDescription !== description){
        dish.description = description
    }
    if (originalPrice !== price){
        dish.price = price
    }
    if (originalImage !== image_url){
        dish.image_url = image_url
    }
    res.json({ data: dish });
}

// function update(req, res) {
//     const dishId = req.params.dishId
//     const matchingDish = dishes.find((dish) => dish.id === dishId) 
//     const { data: { name, description, price, image_url } = {} } = req.body

// matchingDish.description = description 
// matchingDish.name = name 
// matchingDish.price = price 
// matchingDish.image_url = image_url

// res.json({ data: matchingDish }) }

module.exports = {
    list,
    create: [
        dishHasName, 
        dishHasDescription, 
        dishHasPrice, 
        priceIsNum, 
        priceIsGreaterThanZero, 
        dishHasImage, 
        create
    ],
    read: [dishExists, read],
    update: [
        dishExists, 
        dishHasName, 
        dishHasDescription, 
        dishHasPrice, 
        priceIsNum, 
        priceIsGreaterThanZero, 
        dishHasImage, 
        dishIdMatches, 
        update
    ]
};