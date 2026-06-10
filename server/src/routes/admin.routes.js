const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/block', adminController.blockUser);

// Businesses
router.get('/businesses', adminController.getAllBusinesses);
router.post('/businesses/:id/verify', adminController.verifyBusiness);
router.post('/businesses/:id/reject', adminController.rejectBusiness);

// Deals
router.get('/deals', adminController.getAllDealsAdmin);

// Categories
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Commission
router.patch('/commission', adminController.updateCommissionSettings);

// Featured
router.patch('/feature/:type/:id', adminController.toggleFeatured);

// Support
router.get('/tickets', adminController.getAllTickets);
router.patch('/tickets/:id/assign', adminController.assignTicket);

// Audit
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
