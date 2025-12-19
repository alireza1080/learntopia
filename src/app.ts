import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api.route.ts';
import appMainErrorHandler from './utils/appMainErrorHandler.utils.ts';
import authMiddleware from 'middlewares/auth.middleware.ts';
import roleLevelMiddleware from 'middlewares/roleLevel.middleware.ts';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use(authMiddleware);
app.use(roleLevelMiddleware);
app.use('/api', apiRoutes);

app.use(appMainErrorHandler);

export default app;
