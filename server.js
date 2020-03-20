const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

//DB config
const db = require("./config/keys").mongoURI;

//Connect to mongodb
mongoose
	.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Mongodb connected successfuly"))
	.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
const app = express();

// USE Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.get("/", (req, res) => {
	res.send("Hello");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
