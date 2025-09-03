import { Router } from 'express';
import authenticationMiddleware from '../../Middlewares/auth.middleware.js';
import { requireAdmin } from '../../Middlewares/authorization.middleware.js';
import dashboardStatsService from './Services/dashboard-stats.service.js';
import demographicChartsService from './Services/demographic-charts.service.js';
import exportReportsService from './Services/export-reports.service.js';

const analyticsController = Router();

analyticsController.get('/dashboard', 
    authenticationMiddleware, 
    requireAdmin, 
    dashboardStatsService
);

analyticsController.get('/demographics', 
    authenticationMiddleware, 
    requireAdmin, 
    demographicChartsService
);

analyticsController.get('/export', 
    authenticationMiddleware, 
    requireAdmin, 
    exportReportsService
);

export default analyticsController;