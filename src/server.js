const express = require('express');
const morgan = require('morgan');
const app = express();
var cors = require('cors');

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));

app.use(cors());

//API ROUTES
require('./routes')(app);

const logger = require('./utils/logger');
require('dotenv').config();

const port = process.env.PORT;
const customHost = process.env.DB_HOST;
const host = customHost || null; 
const prettyHost = customHost || 'localhost';

// Start your app.
app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }
  
  logger.appStarted(port, prettyHost);

});
console.log(`Server started on port ${port}`);
