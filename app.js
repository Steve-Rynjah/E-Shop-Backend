const express = require('express');
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config');
const authJwt = require('./helpers/jwt.helper');
const errorHandler = require('./helpers/error-handler.helper')

app.use(cors());
app.options("*", cors());


//Middleware
app.use(express.json()); // aka middleware - To parse json data
app.use(morgan('tiny')); // aka middleware - To log at the server side
app.use(authJwt()); //aka middleware - To secure the API of the server
app.use('/public/uploads', express.static(__dirname + '/public/uploads')) //To make images view public
app.use(errorHandler)




//Routes
const productRouter = require('./router/product.route')
const categoryRouter = require('./router/category.route')
const orderRouter = require('./router/order.route')
const userRouter = require('./router/user.route');


const api = process.env.API_URL;

app.use(`${api}/products`, productRouter)
app.use(`${api}/categories`, categoryRouter)
app.use(`${api}/orders`, orderRouter)
app.use(`${api}/users`, userRouter)


//Database
mongoose.connect(process.env.CONNECTION_URL)
.then(()=>{
    console.log("Database connected successfully")
})
.catch((err)=>{
    console.log(err)
})

//For Development

// app.listen(3000, ()=>{
//     console.log(api)
//     console.log("Server started at http://localhost:3000")
// })

// For Production

var server = app.listen(process.env.PORT || 3000, function() {
    var port = server.address().port;
    console.log("Express is working on port " + port)
})



