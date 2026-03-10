const app = require("./src/app");
const connectDB = require("./src/config/db");
require("dotenv").config();

const port = process.env.PORT || 8080;

// Connect to Database
connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
