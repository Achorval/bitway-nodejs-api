const AuthenticationMiddlewares = require('../http/middlewares/AdminMiddleware');
const AdminController = require('../http/controllers/admin/AdminController');
const SystemController = require('../http/controllers/admin/SystemController');

module.exports = (app) => {  
  app.post('/admin/login', 
    AdminController.login);
  app.get('/admin', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.adminDetail);
  app.get('/admin/dashboard', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.dashboard);    
  app.post('/admin/suspend/user', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.suspendUser);
  app.get('/admin/transactions', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.fetchTransactions);
  app.get('/admin/transactions/details', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.fetchTransactionsDetails);
  app.post('/admin/transactions/status/update', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateTransactionStatus);

  app.get('/admin/users', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.fetchUsers);
  app.get('/admin/users/user', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.fetchUser);
  app.get('/admin/withdraw', 
    AuthenticationMiddlewares.adminMiddleware, 
    AdminController.withdraw);
  app.get('/admin/withdrawals', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.fetchWithdrawals);
  app.put('/admin/withdrawals/update', 
    AuthenticationMiddlewares.adminMiddleware,
    AdminController.updateWithdrawal);
      
  app.get('/admin/services', 
    AuthenticationMiddlewares.adminMiddleware,
    SystemController.fetchServices);
  app.post('/admin/services/create', 
    AuthenticationMiddlewares.adminMiddleware,
    SystemController.createService);
  app.get('/admin/services/edit/:id', 
    AuthenticationMiddlewares.adminMiddleware,
    SystemController.editService);
  app.put('/admin/services/update/:id',
    AuthenticationMiddlewares.adminMiddleware, 
    SystemController.updateService);
  app.delete('/admin/services/delete/:id',
    AuthenticationMiddlewares.adminMiddleware, 
    SystemController.deleteService);
  app.put('/admin/services/status', 
    AuthenticationMiddlewares.adminMiddleware,
    SystemController.serviceStatus);
}

