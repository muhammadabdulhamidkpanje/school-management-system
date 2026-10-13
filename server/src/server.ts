import app from "./index.js";
import { ensureDefaultRoles } from "./config/seed.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

const start = async () => {
  await ensureDefaultRoles();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
