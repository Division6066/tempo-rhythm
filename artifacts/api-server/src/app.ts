import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api", router);

export default app;
