# 🧠 AI 영화 추천 시스템 - Node.js Backend

> 개인화 추천 기능을 위한 **Express + MySQL** 기반 API 서버

[👉 배포된 사이트 바로가기](https://reco-client-nu.vercel.app/)  
[👉 ERD](https://www.erdcloud.com/d/uCAkSgPD6LHhFkF2Z/)

---

## 📦 주요 기능

- ✅ 이메일 중복 체크 API (`POST /check-email`)
- ✅ 사용자 등록 API (`POST /register`)
- ✅ 이메일 인증코드 발송 (`POST /send-code`)
- ✅ 이메일 인증코드 검증 (`POST /verify-code`)
- ✅ (예정) 영화 추천 결과 API (`GET /recommendations`)
- 🔐 AES + SHA 암호화 저장 (이메일/비밀번호)

---

## 🔗 API 라우팅 구조

| Method | Endpoint         | 설명               |
|--------|------------------|--------------------|
| POST   | /check-email     | 이메일 중복 확인    |
| POST   | /register        | 회원가입           |
| POST   | /send-code       | 인증코드 이메일 전송 |
| POST   | /verify-code     | 인증코드 검증      |
| GET    | /recommendations | 영화 추천 (예정)   |

---

## 🛠 기술 스택

| 영역       | 기술                                |
|------------|-------------------------------------|
| Backend    | Node.js (Express)                  |
| Database   | MySQL + AES_ENCRYPT                |
| ORM        | `mysql2/promise`                   |
| 인증       | SHA-256 + 환경변수 기반 암호화     |

---