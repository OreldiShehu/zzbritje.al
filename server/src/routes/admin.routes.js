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
router.patch('/businesses/:id/verify', adminController.verifyBusiness);
router.post('/businesses/:id/reject', adminController.rejectBusiness);
router.patch('/businesses/:id/reject', adminController.rejectBusiness);
router.patch('/businesses/:id/plan', adminController.updateBusinessPlan);

// Deals
router.get('/deals', adminController.getAllDealsAdmin);
router.patch('/deals/:id/approve', adminController.approveDeal);
router.patch('/deals/:id/reject', adminController.rejectDeal);
router.patch('/deals/:id/featured', adminController.featureDeal);
router.delete('/deals/:id', adminController.deleteDeal);

// Categories
router.post('/categories', adminController.createCategory);
router.post('/categories/seed-defaults', adminController.seedDefaultCategories);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Commission & Finances
router.patch('/commission', adminController.updateCommissionSettings);
router.get('/commission-tracker', adminController.getCommissionTracker);
router.get('/finances', adminController.getCommissionTracker);
router.get('/finances/:id', adminController.getBusinessFinances);
router.patch('/businesses/:id/collect', adminController.markCollected);
router.post('/reset-commission-rates', adminController.resetCommissionRates);
router.post('/backfill-deal-prices', adminController.backfillDealPrices);

// Featured
router.patch('/feature/:type/:id', adminController.toggleFeatured);

// Support
router.get('/tickets', adminController.getAllTickets);
router.patch('/tickets/:id/assign', adminController.assignTicket);

// Audit
router.get('/audit-logs', adminController.getAuditLogs);

// Danger Zone — development only (blocked in production by controller)
if (process.env.NODE_ENV !== 'production') {
  router.post('/reset-test-data', adminController.resetTestData);
}

module.exports = router;
