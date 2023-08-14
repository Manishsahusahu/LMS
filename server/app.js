import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();
app.use(express.urlencoded({ extended: true })); // helps to get params from encoded url's
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
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.use("/ping", (req, res, next) => {
  res.send("/pong");
});

app.all("*", (req, res) => {
  res.status(404).send("Error! Page not found");
});

export default app;
