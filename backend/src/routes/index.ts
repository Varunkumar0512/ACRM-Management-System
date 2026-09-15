import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import researchRoutes from './researchRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import supportRoutes from './supportRoutes.js';
import adminRoutes from './adminRoutes.js';
import searchRoutes from './searchRoutes.js';
import iprRoutes from './iprRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/research', researchRoutes);
router.use('/faculty', facultyRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);
router.use('/admin', adminRoutes);
router.use('/search', searchRoutes);
router.use('/ipr', iprRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ACRM — Automated Campus Research Management API',
    version: '1.0.0',
  });
});

export default router;
