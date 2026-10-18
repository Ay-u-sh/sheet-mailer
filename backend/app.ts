import "dotenv/config";
import express from "express";

const app = express();
const port: number = Number(process.env.PORT || 3000);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok"
  });
});

app.listen(port, () => {
  console.log(`Sheet Mailer backend listening on port ${port}`);
});