import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(json());
app.use(cookieParser());
app.use(morgan("dev")); // it gives log in console whatever activity user is performing through hitting apis

app.use("/api/v1/user", userRoutes);
app.use("/ping", (req, res, next) => {
  res.send("/pong");
});

app.all("*", (req, res) => {
  res.status(404).send("Error! Page not found");
});

export default app;
