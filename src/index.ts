import express from "express";
import { ENVIRONMENT } from "./utils/environment";
import router from "./routes/index.route";
import helmet from "helmet";
import path from "path";
import morgan from "morgan"

const app = express();

//Logger
app.use(morgan("tiny"))

//App  settings
app.set("etag", "strong");
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

//Public Route (Most Project Don't Need This)
app.use("/public", express.static(path.join(__dirname, "public")));

//Main API Route
app.use("/api", router);

app.listen(ENVIRONMENT.PORT, () => {
  console.log(`Server is running on port ${ENVIRONMENT.PORT}`);
});
