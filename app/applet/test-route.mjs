const express = require("express");
const app = express();
app.get("/api/test", (req, res) => res.send("OK"));
app.get("*all", (req, res) => res.status(404).send("NOT FOUND"));
app.listen(3001, () => {
  fetch("http://localhost:3001/api/test").then(r=>r.text()).then(t=>{
    console.log("API:", t);
    process.exit(0);
  });
});
