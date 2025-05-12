const router = require('express').Router();
const pool = require('../src/db');

// 이메일 중복 체크
router.post('/check-email', async (req, res) => {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res.status(400).json({ error: '이메일을 입력해주세요.' });
    }

    const conn = await pool.getConnection();
    const sql = `
      SELECT COUNT(*) as count
      FROM users
      WHERE user_email = AES_ENCRYPT(?, ?);
    `;
    const [rows] = await conn.execute(sql, [user_email, process.env.MYSQL_KEY]);
    conn.release(); // 반납 중요!

    res.status(200).json({ exists: rows[0].count > 0 });

  } catch (err) {
    console.error('check-email 오류:', err);
    res.status(500).json({ error: '이메일 중복 확인 실패' });
  }
});

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

    const conn = await pool.getConnection();

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
      JSON.stringify(user_preferences)
    ]);

    conn.release();

    res.status(200).json({ message: '회원가입이 완료되었습니다.' });

  } catch (err) {
    console.error("register 오류:", err);
    res.status(500).json({ error: err.message || '서버 오류가 발생했습니다.' });
  }
});


module.exports = router;
