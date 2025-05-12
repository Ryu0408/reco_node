const serverlessExpress = require('@vendia/serverless-express');
const app = require('./index');
require('dotenv').config();

exports.handler = serverlessExpress({ app });