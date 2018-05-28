const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
//Import config data
const {DATABASE_URL, PORT} = require('./config');

//Call routers
const passport = require('passport');
const { userRouter} = require('./users');
const { Router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { productsRouter} = require('./products/productsRouter');
const {bugsRouter} = require('./bugs/bugsRouter');

//Create App
const app = express();

/* CORS  setup */
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');
//Enable CORS
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

//User Authentication
passport.use(localStrategy);
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', {session:false});



//Middleware and routers
app.use(express.static('public'));
app.use(morgan('common'));

//API ENDPOINTS
app.use('/api/users', userRouter);
app.use('/api/login', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/bugs', bugsRouter);
app.get('/api/*', (req, res) => {
    res.json({ok: true});
 });


// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
      console.log('starting runserver..');
      mongoose.connect(databaseUrl, err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
  }

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }

if(require.main === module){
    runServer(DATABASE_URL).catch(err => console.error(err));
};


module.exports = {app, runServer, closeServer};