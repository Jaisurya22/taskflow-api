const express = require("express");

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
    res.json({
        message: "TaskFlow API is running"
    });
});

app.listen(3000, function () {
    console.log("Server running on port 3000");
}); 