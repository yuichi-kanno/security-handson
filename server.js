const crypto = require("crypto");
const express = require("express");
const api = require("./routes/api");
const csrf = require("./routes/csrf");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/api", api);
app.use("/csrf", csrf);

app.get("/", (req, res, next) => {
  res.end("Top Page");
});

app.get("/csp", (req, res, next) => {
  const nonceValue = crypto.randomBytes(16).toString("base64");

  res.header(
    "Content-Security-Policy",
    `script-src 'nonce-${nonceValue}' 'strict-dynamic';` +
      "object-src 'none';" +
      "base-uri 'none;'"
  );
  res.render("csp", { nonce: nonceValue });
});

app.listen(port, () => {
  console.log(`Serverが起動しました。portは${port}番です。`);
});
