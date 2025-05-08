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
        host: 'reco-db.c3e2okceayfz.ap-northeast-2.rds.amazonaws.com',
        user: 'admin',
        password: 'tmdghks2060!',
        database: 'reco-schema'
      });
  
      const sql = `
        INSERT INTO users (
          user_email, user_password, user_name, user_age, user_gender, user_preferences
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
  
      await conn.execute(sql, [
        user_email,
        user_password,
        user_name,
        user_age,
        user_gender,
        JSON.stringify(user_preferences)
      ]);
  
      await conn.end();
  
      res.status(200).json({ message: 'User registered successfully' });
  
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

module.exports = router;
