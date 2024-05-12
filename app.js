const express = require('express');
const passport = require('passport');
const bodparser = require('body-parser')
require('dotenv').config()
const blogRoute = require('./routes/blog')
const authRoute = require('./routes/auth')
const db = require('./db')
const logger = require('./logger/logger');
const httpLogger = require('./logger/httpLogger')
// const { User, Blog } = require('./model');
// const { authenticate } = require('passport');
require("./authentication/auth")

const app = express()


db.connectToMongo()
const port = process.env.PORT||3000

app.use(bodparser.json())
app.use('/', authRoute)
app.use('/blog', blogRoute)
app.use(httpLogger)

app.get('/', (req, res)=>{
    logger.info('The home page was requested');
    res.send('Welcome to My Blog')
})
// throw  error to simulate a server error
app.get('/error', (req, res) => {
	throw new Error('An error occurred');
});


//error handler
app.use((err, req, res, next) => {
	logger.error(err.message);
	res.status(500).send('Something failed');
});

app.listen(port, ()=>{
    console.log(`server running at port ${port}`)
})