require("dotenv").config();
require("express-async-errors");

//npm security packages
const { rateLimit } = require("express-rate-limit");
const { xss } = require("express-xss-sanitizer");
const helmet = require("helmet");
const cors = require("cors");

const express = require("express");
const app = express();

const connectDB = require("./db/connect");

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      "<h1>Wecome to Jobs-API please check the documentation<a href='docs'>Docs</a></h1>"
    );
});

const authenticateUser = require("./middleware/authentication");

const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust-proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(cors());
app.use(xss());

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
