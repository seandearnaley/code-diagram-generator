const express = require("express");
const app = express();
app.use(express.json());

app.post("/query", (req, res) => {
  const data = req.body;

  console.log("request body=", data);
  // Process the data...
  res.json({ result: "success", data: data });
});

app.listen(3000, () => console.log("Server running on port 3000"));
