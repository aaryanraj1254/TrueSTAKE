import dotenv from 'dotenv';
import { app } from './app';
import { logger } from './utils/logger';

dotenv.config();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
