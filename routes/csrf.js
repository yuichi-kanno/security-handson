const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const router = express.Router();

router.use(
  session({
    secret: "session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 1000 * 5,
    },
  })
);

router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

// セッションデータを保持
let sessionData = {};

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  // 検証用のためユーザー名とパスワードは固定
  if (username !== "user1" || password !== "Passw0rd!#") {
    res.status(403);
    res.send("ログイン失敗");
    return;
  }

  // セッションにユーザー名を格納
  sessionData = req.session;
  sessionData.username = username;
  // CSRF検証用ページへリダイレクト
  res.redirect("/csrf_test.html");
});

router.post("/remit", (req, res) => {
  // セッションに保存した情報からログイン済みか確認する
  if (!req.session.username || req.session.username !== sessionData.username) {
    res.status(403);
    res.send("ログインしていません");
    return;
  }

  // 本来はデータベースの書き換えなどの処理が行われる。
  const { to, amount } = req.body;
  res.send(`「${to}」へ${amount}円送金しました。`);
});

module.exports = router;
