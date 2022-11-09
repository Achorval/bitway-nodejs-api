const AuthenticationMiddlewares = require('../http/middlewares/UserMiddleware');
const UserController = require('../http/controllers/user/UserController');

module.exports = (app) => {
  app.post('/register', 
    UserController.register);
  app.post('/login', 
    UserController.login);
  app.post('/account/recover',  
    UserController.forgotPassword);
  app.post('/reset/password', 
    AuthenticationMiddlewares.recoveryMiddleware,
    UserController.resetPassword);
  app.post('/validate/email',  
    AuthenticationMiddlewares.emailMiddleware,
    UserController.processValidateEmail);
  app.post('/resend/email', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.resendVerifyEmail);
  
  app.get('/dashboard', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchDashboard); 
  app.get('/user', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.getUserDetails);
  app.post('/profile/update',   
    AuthenticationMiddlewares.userMiddleware, 
    UserController.updateProfile);
  app.post('/security/change-password', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.changePassword);
  app.post('/verify/password',   
    AuthenticationMiddlewares.userMiddleware,
    UserController.verifyPassword);
  app.post('/security/pin',   
    AuthenticationMiddlewares.userMiddleware,
    UserController.securityPin);
  app.post('/security/2FAuth',   
    AuthenticationMiddlewares.userMiddleware,
    UserController.updateTwoFactorAuth);
    
  app.get('/bank/accounts', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchBankAccounts);
  app.post('/bank/account/verify', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.verifyAccountNumber);
  app.post('/bank/account/create', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.createBankAccount);
  app.get('/bank/account/edit/:id', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.editBackAccount);
  app.put('/bank/account/update/:id', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.updateBankACcount);
  app.delete('/bank/accounts/delete/:id', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.deleteBankAccount);  
  app.get('/bank/list', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.fetchBankList);

  app.get('/transactions', 
    AuthenticationMiddlewares.userMiddleware,
    UserController.fetchTransactions);
  app.post('/withdraw', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.withdraw);  
     
  app.get('/service',
    AuthenticationMiddlewares.userMiddleware,
    UserController.fetchService);
  app.post('/trade/bitcoin', 
    AuthenticationMiddlewares.userMiddleware,
    UserController.createTradeBitcoin);
  app.post('/trade/usdt', 
    AuthenticationMiddlewares.userMiddleware,
    UserController.createTradeUsdt);
  app.post('/toggle/balance', 
    AuthenticationMiddlewares.userMiddleware, 
    UserController.toggleBalance);
};

