const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//list
function list(req, res) {
    res.json({ data: orders });
  };

//validation
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === (orderId));
    if (foundOrder) {
     res.locals.order = foundOrder;
        return next();
}
    next({
        status: 404,
        message: `Order id not found: ${orderId}`,
    });
};

// function orderHasDeliverTo(req, res, next) {
//     const { data: { deliverTo } = {} } = req.body;
//     if (!deliverTo || deliverTo === "") {
//         next({
//             status: 400,
//             messsage: "Order must include a deliverTo"
//         });
//     }
//     return next();
// }

function orderHasDeliverTo(request, response, next) {
    const {
      data: { deliverTo },
    } = request.body;
  
    if (!deliverTo || deliverTo === "") {
      next({
        status: 400,
        message: "Order must include a deliverTo",
      });
    }
  
    response.locals.deliverTo = deliverTo;
    next();
  }

function orderHasMobileNumber(req, res, next){
    const {data: {mobileNumber} = {} } = req.body;
    if(!mobileNumber || mobileNumber === ""){
        next({
            status: 400,
            message: "Order must include a mobileNumber"
        })
    }
    return next()
}

function orderHasDishes(req, res, next){
    const { data: {dishes} = {} } = req.body;
    if(!dishes){
        next({
            status: 400,
            message: "Order must include a dish"
        })
    }
    return next()
}

function isDishAnArray(req, res, next){
    const {data : {dishes} = {} } = req.body;
    if(Array.isArray(dishes)){
        return next();
    }
    next({
        status: 400, 
        message: 'dishes needs to be an array.'
    })
}

function includesMoreThanOneDish(req, res, next){
    const {data: {dishes} = {} } = req.body;
    if(dishes <= 0){
        next({
            status: 400,
            message:"Order must include at least one dish"
        })
    }
    return next()
}


function orderHasQuantity(req, res, next){
    const {data: { dishes } = {}} = req.body
    const missingQuantity = dishes.find((dish) => !dish.quantity)
    if(missingQuantity){
        const index = dishes.indexOf(missingQuantity)
        next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0.`
        })
    }
    return next();
}

// function quantityIsGreaterThanZero(req, res, next){
//     const {data: {quantity} = {} } = req.body;
//     if(quantity <= 0){
//         next({
//             status: 400,
//             message:`Dish ${index} must have a quantity that is an integer greater than 0`
//         })
//     }
//     return next()
// }

function orderQuantityIsInteger(req, res, next){
    const {data: {dishes} = {}} = req.body
    const notAInteger = dishes.find((dish) => !Number.isInteger(dish.quantity))
    if(notAInteger){
        const index = dishes.indexOf(notAInteger)
        next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0.`
        })
    }
    return next();
}

function orderHasStatus(req, res, next){
    const {data: {status} = {}} = req.body
    if(!status){
        next({
            status: 400,
            message: 'Order status is required.'
        })
    }
    return next();
}

function orderHasValidStatus(req, res, next){
    const {data: {status} = {}} = req.body
    if(status === "pending" || status === "preparing" || status === "out-for-delivery" || status === "delivered"){
        return next();
    }
    next({
        status: 400, 
        message: 'Order must have a valid status.'
    })
}

function checkStatusForPending(req, res, next){
    const order = res.locals.order
    const {status} = order
    if(status !== "pending"){
        next({
            status: 400,
            message: 'Order is pending and cannot be deleted.'
        })
    }
    return next();
}

function orderIdMatches(req, res, next){
    const {orderId} = req.params
    const {data: {id} = {}} = req.body
    if(orderId === id || !id){
        return next();
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
    })
}

function destroy(req, res, next){
    const {orderId} = req.params
    const index = orders.findIndex((order) => Number(order.id) === Number(orderId))
    const deletedOrders = orders.splice(index, 1)
    res.sendStatus(204)
}

//create
function create(req, res){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

//read
function read(req, res){
    res.json({ data: res.locals.order });
}

//update
function update(req, res){
    const order = res.locals.order;
    const originalDeliverTo = order.deliverTo;
    const originalMobileNumber = order.mobileNumber;
    const originalStatus = order.status;
    const originalDish = order.dish;
    const { data: { deliverTo, mobileNumber, status, dish } = {} } = req.body;

    if (originalDeliverTo !== deliverTo) {
        // Update the dish
        order.deliverTo = deliverTo
    }
    if (originalMobileNumber !== mobileNumber){
        order.mobileNumber = mobileNumber
    }
    if (originalStatus !== status){
        order.status = status
    }
    if (originalDish !== dish){
        order.dish = dish
    }
    res.json({ data: order });
}


module.exports = {
    list,
    create: [
        orderHasDeliverTo,
        orderHasDishes,
        isDishAnArray,
        includesMoreThanOneDish,
        orderHasMobileNumber,
        orderHasQuantity,
        orderQuantityIsInteger,
        create
    ],
    read: [orderExists, read],
    update:[
        orderExists, 
        orderHasDeliverTo, 
        orderHasMobileNumber, 
        orderHasStatus, 
        orderHasValidStatus,
        orderHasDishes, 
        isDishAnArray,
        includesMoreThanOneDish,
        orderHasQuantity, 
        orderQuantityIsInteger,
        orderIdMatches,
        update
    ],
    delete: [orderExists, checkStatusForPending, destroy]
}