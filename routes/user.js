const router = require('express').Router();
const mysql = require('mysql2/promise');

router.post('/register', async (req, res) => {
    try {
      const {
        user_email,
        user_password,
        user_name,
        user_age = 25,
        user_gender = 'M',
        user_preferences = {}
      } = req.body;
  
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
  
      const sql = `
        INSERT INTO users (
          user_email,
          user_password,
          user_name,
          user_age,
          user_gender,
          user_preferences
        ) VALUES (
          AES_ENCRYPT(?, ?),
          SHA2(?, 256),
          AES_ENCRYPT(?, ?),
          ?, ?, ?
        );
      `;
  
      await conn.execute(sql, [
        user_email, process.env.MYSQL_KEY,
        user_password,
        user_name, process.env.MYSQL_KEY,
        user_age,
        user_gender,
        JSON.stringify(user_preferences)]);
  
      await conn.end();
  
      res.status(200).json({ message: 'User registered successfully' });
  
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

module.exports = router;
