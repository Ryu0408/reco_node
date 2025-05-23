const router = require('express').Router();
const pool = require('../src/db');
const nodemailer = require('nodemailer');

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

router.post('/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: '이메일이 필요합니다.' });

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const conn = await pool.getConnection();
    await conn.execute(
      `
      REPLACE INTO email_verifications (email, code, expires_at)
      VALUES (?, ?, ?)
      `,
      [email, code, expiresAt]
    );
    conn.release();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"RYUFLIX" <ryuga77758@gmail.com>',
      to: email,
      subject: '[RYUFLIX] 이메일 인증코드',
      html: `
        <div style="font-family: 'Pretendard', 'Noto Sans KR', sans-serif; padding: 24px; border: 1px solid #eee; border-radius: 12px; max-width: 500px; margin: 0 auto; background-color: #fafafa;">
          <h2 style="color: #ff4d4d;">RYUFLIX 이메일 인증</h2>
          <p style="font-size: 16px; color: #333;">아래 인증코드를 입력하여 이메일 주소를 인증해 주세요.</p>
          <div style="margin: 24px 0; padding: 16px; background: #fff; border: 1px dashed #ff4d4d; border-radius: 8px; text-align: center;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #ff4d4d;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #888;">※ 인증코드는 발송 시점으로부터 5분간 유효합니다.</p>
          <p style="font-size: 13px; color: #aaa; margin-top: 32px;">© 2025 RYUFLIX. All rights reserved.</p>
        </div>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('send-code 오류:', err);
    res.status(500).json({ error: '인증코드 전송 실패' });
  }
});

router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      verified: false,
      reason: '이메일과 인증코드를 모두 입력해주세요.'
    });
  }

  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.execute(
      `SELECT code, expires_at FROM email_verifications WHERE email = ?`,
      [email]
    );

    conn.release();

    const row = rows[0];

    if (!row) {
      return res.status(200).json({
        verified: false,
        reason: '인증코드가 존재하지 않거나 발송되지 않았습니다.'
      });
    }

    const now = new Date();

    if (now > row.expires_at) {
      return res.status(200).json({
        verified: false,
        reason: '인증코드가 만료되었습니다.'
      });
    }

    if (code !== row.code) {
      return res.status(200).json({
        verified: false,
        reason: '인증코드가 일치하지 않습니다.'
      });
    }

    await conn.execute('DELETE FROM email_verifications WHERE email = ?', [email]);

    return res.status(200).json({
      verified: true,
      message: '이메일 인증이 완료되었습니다.'
    });

  } catch (err) {
    console.error('verify-code 오류:', err);
    return res.status(500).json({
      verified: false,
      error: '서버 오류로 인증에 실패했습니다.'
    });
  }
});



module.exports = router;
