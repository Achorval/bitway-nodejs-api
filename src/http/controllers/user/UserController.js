let Validator = require('validatorjs');
const { Op } = require('sequelize');
const thirdParty = require('../../../utils/ThirdParty');
const emailSender = require('../../../utils/mailer');
const { cloudinary } = require('../../../utils/cloudinary');
const { 
  titleCase, 
  uniqueNumber, 
  auditLog, 
  compareHashPassword, 
  accessToken, 
  refresToken, 
  hashPassword,
  limitAndOffset
} = require("../../../utils/Functions");
// ** Models
const {
  user,
  balance,
  service,
  transaction,
  bankAccount
} = require('../../../models');
const axios = require('axios');

/**
 * Get a user details for a login user.
 *
 * @param  array  $data
 * @return User
 */
exports.getUserDetails = async (request, response) => {
  try {
    return response.status(200).send({
      data: request.authUser,
      status: 'success',
      message: 'User details retrieved successfully!'
    })
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

/**
 * Create a new user for an incoming registration request.
 *
 * @param  array  $data
 * @return User
 */
exports.register = async (request, response) => {
  try {
    // Validation Rules
    let rules = {
      firstname: 'required',
      lastname: 'required',
      email: 'required',
      phone: 'required',
      password: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };

    const { firstname, lastname, email, phone, password } = request.body;

    // ** Check existing email
    const emailExist = await user.findOne({
      where: {
        email: email.toLowerCase()
      }
    });
    
    if (emailExist) {
      return response.status(401).send({
        status: 'error',
        message: 'This email is already in use.'
      });
    };

    // ** Check existing phone
    const phoneExist = await user.findOne({
      where: {
        phone: phone
      }
    });

    if (phoneExist) {
      return response.status(401).send({
        status: 'error',
        message: 'This phone number is already in use.'
      });
    };

    // ** Create a new user
    const userData = await user.create({
      firstname: await titleCase(firstname),
      lastname: await titleCase(lastname),
      photoUrl: '',
      email: email.toLowerCase(),
      isEmailVerified: false,
      emailVerifiedAt: null,
      phone: phone,
      phoneVerificationCode: '',
      isPhoneVerified: false,
      phoneVerifiedAt: null,
      dob: '',
      gender: '',
      password: hashPassword(password),
      bvn: null,
      isBvnVerified: false,
      bvnVerifiedAt: null,
      isDocumentVerified: false,
      documentVerifiedAt: null,
      transactionPin: '',
      hasTransactionPin: false,
      balanceStatus: false,
      rememberToken: '',
      roleId: 1,
      blocked: false,
      blockedAt: null,
      blockedReason: ''
    });

    // ** Create user balance
    await balance.create({  
      userId: userData.id,
      previous: 0.00,
      book: 0.00,
      current: 0.00,
      status: true,
    });

    // ** Send Verification Email
    const sendPulseData = await emailSender.sendPulseAuthorization();
    await axios.post(`https://api.sendpulse.com/smtp/emails`, {
      "email": {
        "subject": "Verify Your Email Address",
        "template": {
          "id": 292161,
          "variables": {
            "firstname": `${userData.firstname}`,
            "lastname": `${userData.lastname}`,
            "verificationUrl": `https://bitway.ng/verify-email/` + accessToken(userData.id)
          }
        },
        "from": {
          "name": "Bitway.ng",
          "email": "support@bitway.ng"
        },
        "to": [
          {
            "name": `${userData.firstname} ${userData.lastname}`,
            "email": email.toLowerCase()
          }
        ]
      }
    } , {
      headers: {
        'Authorization': `Bearer ${sendPulseData.access_token}`,
        'content-type': 'application/json'
      }
    });
    
    return response.status(200).send({
      status: 'success',
      message: 'Account created successfully!'
    });

  } catch (error) {
    return response.status(400).send({
      error: error,
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Verify a user for an incoming login request.
 *
 * @param  array  $data
 * @return User
 */
exports.login = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      username: 'required',
      password: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }

    const { username, password } = request.body;

    // ** Email or phone
    const payload = {
      [Op.or]: [{
        email: {
          [Op.substring]: username.toLowerCase()}
        },
        {
        phone: {
          [Op.substring]: username}
        }
      ]
    };

    // ** Find email or phone
    const userData = await user.findOne({
      where: payload,
      include: {
        model: balance,
        required: true,
        where: {
          status: true
        },
        attributes: [
          'current'
        ]
      }
    });

    if(!userData) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

     // ** Check if user is blocked
    if(userData.blocked === true) {
      return response.status(403).send({
        status: 'error',
        message: 'Account is deactivated, contact support!'
      });
    };

    // ** Compare password
    if(!compareHashPassword(password, userData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

    // ** Check user role
    if(userData.roleId !== 1) {
      return response.status(403).send({
        status: 'error',
        message: 'Account is not allowed!'
      });
    };

    // ** User login audit
    await auditLog({
      userId: userData.id,
      request: {
        username: request.body.username,
        password: hashPassword(request.body.password)
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'userLogin'
    });

    return response.send({
      data: {
        accessToken: accessToken(userData.id),
        refreshToken: refresToken(userData.id),
        userData: userData
      },
      status: 'success',
      message: 'Login authentication was successful!'
    });

  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Verify user for an incoming email verification request.
 *
 * @param  Request  $request
 * @return Response
 */
exports.processValidateEmail = async (request, response) => {
  try {
   
    const userData = await user.findOne({
      where: {
        id: request.authUser.id
      }
    });

    if (userData === null) {
      return response.status(401).send({
        status: 'error',
        message: 'User not found, contact support!'
      });
    };

    if (userData.isEmailVerified && userData.emailVerifiedAt !== null) {
      return response.status(200).send({
        status: 'success',
        message: 'Your email address is already verified!'
      });
    }

    await userData.update({
      isEmailVerified: true,
      emailVerifiedAt: Date.now()
    });

    // ** verify email audit
    await auditLog({
      userId: userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'validateEmail'
    });

    return response.status(200).send({
      status: 'success',
      message: 'Your email address has been verified successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.resendVerifyEmail = async (request, response) => {
  try {
    // ** User exist
    const userData = await user.findOne({
      where: {
        id: request.authUser.userData.id
      }
    });

    if (userData === null) {
      return response.status(401).send({
        status: 'error',
        message: 'User not found!'
      });
    }

    // ** Send Verification Email
    const sendPulseData = await emailSender.sendPulseAuthorization();
    await axios.post(`https://api.sendpulse.com/smtp/emails`, {
      "email": {
        "subject": "Verify Your Email Address",
        "template": {
          "id": 292161,
          "variables": {
            "firstname": `${userData.firstname}`,
            "lastname": `${userData.lastname}`,
            "verificationUrl": `https://bitway.ng/verify-email/` + accessToken(userData.id)
          }
        },
        "from": {
          "name": "Bitway.ng",
          "email": "support@bitway.ng"
        },
        "to": [
          {
            "name": `${userData.firstname} ${userData.lastname}`,
            "email": userData.email
          }
        ]
      }
    } , {
      headers: {
        'Authorization': `Bearer ${sendPulseData.access_token}`,
        'content-type': 'application/json'
      }
    });

    // ** Resend verify email audit
    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'resendVerifyEmail'
    });

    return response.status(200).send({
      status: 'success',
      message: 'Activation link has been sent to Your email!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.forgotPassword = async (request, response) => {
  try {
    // ** User exist
    const userData = await user.findOne({
      where: {
        email: request.body.email
      }
    });

    if (!userData) {
      return response.status(401).send({
        status: 'error',
        message: 'User email not found!'
      });
    }

    // ** Account Recovery Email
    const sendPulseData = await emailSender.sendPulseAuthorization();
    await axios.post(`https://api.sendpulse.com/smtp/emails`, {
      "email": {
        "subject": "Reset your Bitway password",
        "template": {
          "id": 292210,
          "variables": {
            "email": `${userData.email}`,
            "firstname": `${userData.firstname}`,
            "lastname": `${userData.lastname}`,
            "verificationUrl": `https://bitway.ng/reset-password/` + accessToken(userData.id)
          }
        },
        "from": {
          "name": "Bitway.ng",
          "email": "support@bitway.ng"
        },
        "to": [
          {
            "name": `${userData.firstname} ${userData.lastname}`,
            "email": userData.email
          }
        ]
      }
    } , {
      headers: {
        'Authorization': `Bearer ${sendPulseData.access_token}`,
        'content-type': 'application/json'
      }
    });

    // ** Forgot password link
    await auditLog({
      userId: userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'resetPasswordLink'
    });

    return response.status(200).send({
      status: 'success',
      message: 'Reset link has been sent to your email'
    });

  } catch (error) {  console.log(error)
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.resetPassword = async (request, response) => {
  try {
    const userData = await user.findOne({
      where: {
        id: request.authUser.id
      }
    });

    if (userData === null) {
      return response.status(401).send({
        status: 'error',
        message: 'User not found, contact support!'
      });
    };

    if (request.body.newPassword !== request.body.retypeNewPassword) {
      return response.status(401).send({
        status: 'success',
        message: 'Password does not match!'
      });
    }

    await userData.update({
      password: hashPassword(request.body.newPassword)
    });

    await auditLog({
      userId: userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'resetPassword'
    });
    
    return response.status(200).send({
      status: 'success',
      message: 'Password Reset has been completed successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

//= ====================================
//  USER CONTROLLER
//--------------------------------------  
/**
 * Show the application admin details.
 *
 * @return void
 */
exports.userDetails = async (request, response) => {
  try {
    return response.status(200).send({
      status: 'success',
      data: request.authUser
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.toggleBalance = async (request, response) => {
  try {
    const userData = await user.findOne({
      where: {
        id: request.authUser.userData.id 
      }
    });

    if (userData) {
      await userData.update({
        balanceStatus: request.body.status
      });

      return response.status(200).send({
        data: request.body.status,
        status: 'success',
        message: 'Your balance status has been changed successfully!'
      });
    };
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    });
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.fetchServices = async (request, response) => {
  try {
    await service.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'name', 
        'slug',
        'status'
      ]
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Services have been retrieved successfully!'
      });
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchTransactions = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await transaction.findAndCountAll({ 
      limit: limit, 
      offset: offset,
      where: {
        userId: request.authUser.userData.id,
      },
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'reference', 
        'amount', 
        'type',
        'narration',
        'status',
        'createdAt'
      ],
      include: [{
        model: service, 
        required: true,
        attributes: [
          'name'
        ] 
      }] 
    }).then(function (result) {
      return response.status(200).send({
        data: {
          totalItems: result.count,
          data: result.rows
        },
        status: 'success',
        message: 'Transactions have been retrieved successfully!'
      });
    }); 
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured try, again later.'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchDashboard = async (request, response) => {
  try {
    const count = await transaction.count({
      where: {
        // userId: request.authUser.id,
        // walletId: request.authUser.primaryWallet.wallet.id
      }
    });

    const inflow = await transaction.sum('amount', { 
      where: { 
        // userId: request.authUser.id,
        type: 'Credit',
        // walletId: request.authUser.primaryWallet.wallet.id 
      } 
    });
    
    const outflow = await transaction.sum('amount', { 
      where: { 
        // userId: request.authUser.id,
        type: 'Debit',
        // walletId: request.authUser.primaryWallet.wallet.id 
      } 
    });

    const data = {
      count: count,
      inflow: inflow,
      outflow: outflow
    }

    return response.send({
      data: data,
      status: 'success',
      message: 'Dashboard records have been retrieved successfully!',
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.updateProfile = async (request, response) => {
  try { 
    const data = await user.findOne({
      where: {
        id: request.authUser.userData.id
      }
    });

    if (data) {
      await data.update({
        firstname: request.body.firstname,
        lastname: request.body.lastname
      });

      await auditLog({
        userId: request.authUser.userData.id,
        request: {
          ...request.body
        },
        response: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'updateProfile'
      });

      return response.send({
        status: 'success',
        message: 'Profile have been updated successfully!'
      });
    }
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Change a password of the resource.
 *
 * @return Response
 */
exports.changePassword = async (request, response) => {
  try {  
    const userData = await user.findOne({
      where: {
        id: request.authUser.userData.id 
      }
    });

    if (!userData) {
      return response.status(400).send({
        status: 'error',
        message: `No user found`,
      });
    }

    if(!compareHashPassword(request.body.currentPassword, userData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Current password is incorrect!'
      });
    };

    if (request.body.newPassword !== request.body.retypeNewPassword) {
      return response.status(400).send({
        status: 'error',
        message: 'New password does not match!'
      });
    }

    await userData.update({
      password: hashPassword(request.body.newPassword)
    });

    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'changePassword'
    });

    return response.status(200).send({
      status: 'success',
      message: 'Password have been changed successfuly!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Verify password of the resource.
 *
 * @return Response
 */
 exports.verifyPassword = async (request, response) => {
  try {  
    const userData = await user.findOne({
      where: {
        id: request.authUser.userData.id 
      }
    });

    if (!userData) {
      return response.status(400).send({
        status: 'error',
        message: `No user found`,
      });
    }

    if(!compareHashPassword(request.body.currentPassword, userData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Current password is incorrect!'
      });
    };

    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'verifyPassword'
    });

    return response.status(200).send({
      status: 'success',
      message: 'Password have been verified successfuly!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Verify password of the resource.
 *
 * @return Response
 */
exports.securityPin = async (request, response) => {
  try {  
    const userData = await user.findOne({
      where: {
        id: request.authUser.userData.id 
      }
    });

    if (!userData) {
      return response.status(400).send({
        status: 'error',
        message: `No user found`,
      });
    };

    // ** Compare password
    if(!compareHashPassword(request.body.password, userData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect user password.'
      });
    };

    await userData.update({
      transactionPin: hashPassword(request.body.pin)
    });

    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'updatePin'
    });

    return response.status(200).send({
      status: 'success',
      message: 'Pin have been updated successfuly!'
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.updateTwoFactorAuth = async (request, response) => {
  try {
    const data = await user.findOne({
      where: {
        id: request.authUser.id
      }
    });
    await data.update({
      twoFactorAuth: request.body.email2FAuth
    });
    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: request.body.email2FAuth ? 'twoFactorAuthEnabled' : 'twoFactorAuthDisabled'
    });
    return response.send({
      data: request.body.email2FAuth,
      status: 'success',
      message: `Two-factor authentication ${request.body.email2FAuth ? 'enabled' : 'disabled'} successfully!`
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

//= ====================================
//  WITHDRAWAL CONTROLLER  
//--------------------------------------
/**
 * Show the application admin details.
 *
 * @return void
 */
exports.withdraw = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      service: 'required',
      amount: 'required',
      bankAccount: 'required',
      pin: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };

    // ** Compare transaction pin
    if(!compareHashPassword(request.body.pin, request.authUser.userData.transactionPin)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect transaction pin.'
      });
    };

    const walletbalance = await balance.findOne({
      where: {
        userId: request.authUser.userData.id,
        status: true
      }
    });

    if (walletbalance.current >= request.body.amount) {
      
      let reference = await uniqueNumber(5);

      walletbalance.update({
        status: false
      });

      const balanceData = await balance.create({
        userId: request.authUser.userData.id,
        previous: walletbalance.current,
        book: request.body.amount,
        current: (parseFloat(walletbalance.current)) - (parseFloat(request.body.amount)),
        status: true
      });

      await transaction.create({
        userId: request.authUser.userData.id,
        serviceId: request.body.service,
        reference: reference,
        amount: request.body.amount,
        balanceId: balanceData.id,
        type: 'Debit',
        bankAccountId: request.body.bankAccount,
        narration: 'Withdrawal initiated',
        status: 'pending',
      });

      await auditLog({
        userId: request.authUser.userData.id,
        request: {
          ...request.body
        },
        response: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'initiateWithdrawal'
      });

      return response.status(200).send({
        status: 'success',
        message: 'Withdrawal request have been sent successfuly!'
      });
    } else {
      return response.status(406).send({
        status: 'error',
        message: 'Insufficient balance in your wallet!'
      });
    }
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

//= ====================================
//  BANK ACCOUNT CONTROLLER
//--------------------------------------
/**
 * Display a listing of the resource.
 *
 * @return Response
 */  
exports.fetchBankAccounts = async (request, response) => {
  try { 
    await bankAccount.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      where: {
        userId: request.authUser.userData.id,
        status: true
      },
      attributes: [
        'id', 
        'bankName', 
        'bankCode', 
        'accountNumber', 
        'accountName',
      ] 
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Bank account have been retrieved successfully!'
      });
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Verify a specified resource in storage.
 *
 * @return Response
 */
exports.verifyAccountNumber = async (request, response) => {
  const data = await thirdParty.paystackGetRequest(`bank/resolve?account_number=${request.body.accountNumber}&bank_code=${request.body.bankCode}`);
  if(data !== false) {
    return response.status(200).send({
      data: data.data,
      status: 'success',
      message: 'Account number verified successfully!'
    });
  } else {
    return response.status(400).send({
      status: 'error',
      message: 'Incorrect bank account details, try again later!'
    });
  }
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.createBankAccount = async (request, response) => {
  try {
    const account = await bankAccount.findOne({
      where: {
        userId: request.authUser.userData.id,
        accountNumber: request.body.accountNumber,
      }
    });
    if (account === null) {
      await bankAccount.create({
        userId: request.authUser.userData.id,
        bankName: request.body.bankName,
        bankCode: request.body.bankCode, 
        accountNumber: request.body.accountNumber,
        accountName: request.body.accountName.toUpperCase(),
        type: 'own'
      });
      await auditLog({
        userId: request.authUser.userData.id,
        request: {
          ...request.body
        },
        response: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'createBankAccount'
      });
      return response.status(201).send({
        status: 'success',
        message: 'Bank account have been created successfully!'
      });
    } else {
      return response.status(401).send({
        status: 'error',
        message: 'Account account already exist!'
      });
    }
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};  

/**
 * Edit the specified resource in storage. 
 *
 * @param  string  $id
 * @return Response
 */
exports.editBackAccount = async (request, response) => {
  try { 
    await bankAccount.findOne({
      where: {
        id: request.params.id,
        userId: request.authUser.userData.id
      },
      attributes: [
        'id', 
        'bankName', 
        'bankCode', 
        'accountNumber', 
        'accountName'
      ] 
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Bank account have been edited successfully!'
      });
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

/**
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
exports.updateBankACcount = async (request, response) => {
  try { 
    const data = await bankAccount.findOne({
      where: {
        id: request.params.id,
        userId: request.authUser.userData.id
      }
    });
    await data.update({
      bankName: request.body.bankName,
      bankCode: request.body.bankCode,
      accountNumber: request.body.accountNumber,
      accountName: request.body.accountName
    });
    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'updateBankAccount'
    });
    return response.status(200).send({
      data: request.params.id,
      status: 'success',
      message: 'Bank account have been updated successfully!'
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Remove the specified resource from storage.
 *
 * @param  string  $id
 * @return Response
 */
exports.deleteBankAccount = async (request, response) => {
  try {
    await bankAccount.findOne({
      where: {
        id: request.params.id,
        userId: request.authUser.userData.id
      }
    }).then(function (data) {
      if (data) {
        data.update({
          status: 0
        });
        return response.status(200).send({
            status: 'success',
            message: 'Bank account have been deleted successfully!'
        });
      }
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchBankList = async (request, response) => {
  try { 
    const data = await thirdParty.paystackGetRequest(`bank`);
    if(data.data.status == true) {
      return response.status(200).send({
        data: data.data.data,
        status: 'success',
        message: 'Bank list have been retrieved successfully!'
      });
    } 
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Show the application admin details.
 *
 * @return void
 */
exports.fetchService = async (request, response) => {
  try {
    await service.findOne({ 
      where: {
        slug: request.query.slug
      },
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'name', 
        'slug',
        'rate',
        'status'
      ]
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Services have been retrieved successfully!'
      });
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    })
  }
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.createTradeBitcoin = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      service: 'required',
      rate: 'required',
      imageUrl: 'required',
      address: 'required',
      amount: 'required',
      amountToReceive: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    };

    const uploadResponse = await cloudinary.uploader.upload(request.body.imageUrl, {
      upload_preset: 'bitway_setups'
    });

    await transaction.create({
      userId: request.authUser.userData.id,
      serviceId: request.body.service,
      reference: await uniqueNumber(4),
      amount: request.body.amountToReceive, 
      balanceId: null,
      type: 'credit',
      imageUrl: uploadResponse.url,
      narration: `$${request.body.amount} bitcoin sold at ${request.body.rate}/$`,
      status: 'pending',
      completedAt: null
    });

    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'createTradeOrder'
    });

    return response.status(201).send({
      status: 'success',
      message: 'Your transaction has been submitted successfully!'
    });

  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.createTradeUsdt = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      service: 'required',
      rate: 'required',
      imageUrl: 'required',
      address: 'required',
      amount: 'required',
      amountToReceive: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }

    const uploadResponse = await cloudinary.uploader.upload(request.body.imageUrl, {
      upload_preset: 'bitway_setups'
    });

    await transaction.create({
      userId: request.authUser.userData.id,
      serviceId: request.body.service,
      reference: await uniqueNumber(3),
      amount: request.body.amountToReceive, 
      balanceId: null,
      type: 'credit',
      imageUrl: uploadResponse.url,
      narration: `$${request.body.amount} usdt sold at ${request.body.rate}/$`,
      status: 'pending',
      completedAt: null
    });

    await auditLog({
      userId: request.authUser.userData.id,
      request: {
        ...request.body
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'createTradeOrder'
    });

    return response.status(201).send({
      status: 'success',
      message: 'Your transaction has been submitted successfully!'
    });

  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};