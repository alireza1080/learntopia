import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api.route.ts';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use('/api', apiRoutes);

export default app;
