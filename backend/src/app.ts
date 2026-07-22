import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import { apiRoutes } from "./routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(morgan("dev"));
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"), {
    fallthrough: false,
    immutable: true,
    maxAge: "1h",
  }),
);

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
