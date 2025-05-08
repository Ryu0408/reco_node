const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const {
      user_email,
      user_password,
      user_name,
      user_age = 25,
      user_gender = 'M',
      user_preferences = {}
    } = body;

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

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User registered successfully' }),
    };

  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal Server Error" })
    };
  }
};
