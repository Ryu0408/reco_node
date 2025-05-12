const express = require('express');
const cors = require('cors');
const serverlessExpress = require('@vendia/serverless-express');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', require('./routes/user'));

if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  exports.handler = serverlessExpress({ app });
} else {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 로컬서버 시작! 주소는 http://localhost:${process.env.PORT}`);
  });
}