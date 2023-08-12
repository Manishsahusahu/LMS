import "dotenv/config.js";
import app from "./app.js";
import connectionToDB from "./config/dbConnections.js";
import cloudinary from "cloudinary";

const PORT = process.env.PORT || 5001;

// cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, async () => {
  await connectionToDB();
  console.log(`Server is listening at http://localhost:${PORT}`);
});
