import mongoose from "mongoose";

mongoose.set("strictQuery", false); // if any not defined db parameter(name, email.....) sent to query to mongodb then please don't give error.

const connectionToDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      process.env.MONGODB_URI || "http://127.0.0.1:27017/lms"
    );
    if (connection) {
      console.log(`Connected to MongoDb ${connection.host}`);
    }
  } catch (error) {
    console.log(error);
    process.exit(1); // if database not connected then terminate all the processes of apis and all.
  }
};

export default connectionToDB;
