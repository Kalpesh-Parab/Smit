import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import ambulanceRoutes from './routes/ambulance.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import authRoutes from './routes/auth.routes.js';
import generatorRoutes from './routes/generator.routes.js';
import towingVanRoutes from './routes/towingVan.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import { connectToWhatsApp } from './services/whatsapp/baileys.service.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

app.get('/api/health', (req, res) => {
  res
    .status(200)
    .json({ status: 'ok', message: 'Smit Office Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/generators', generatorRoutes);
app.use('/api/towing-vans', towingVanRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contacts', contactsRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Live on http://localhost:${PORT}`);
    connectToWhatsApp();
  });
});
