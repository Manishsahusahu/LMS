import "dotenv/config.js";
import app from "./app.js";
import connectionToDB from "./config/dbConnections.js";

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  await connectionToDB();
  console.log(`Server is listening at http://localhost:${PORT}`);
});
