let Validator = require('validatorjs');
const { Op } = require('sequelize');
const axios = require('axios');
const { 
  compareHashPassword, 
  accessToken, 
  refresToken, 
  hashPassword,
  auditLog,
  limitAndOffset,
  paginate
} = require("../../../utils/Functions");
const { 
  user, 
  withdraw, 
  transaction, 
  bankAccount,
  service,
  balance
} = require('../../../models');

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

    const payload = {
      [Op.or]: [{
        email: {
          [Op.substring]: request.body.username.toLowerCase()}
        },
        {
        phone: {
          [Op.substring]: request.body.username}
        }
      ]
    };

    const adminData = await user.findOne({
      where: payload
    });
    
    if (!adminData) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

    if(adminData.blocked === true) {
      return response.status(403).send({
        status: 'error',
        message: 'Account is deactivated, contact support!'
      });
    };
    
    if(!compareHashPassword(request.body.password, adminData.password)) {
      return response.status(401).send({
        status: 'error',
        message: 'Incorrect login details.'
      });
    };

    // ** Check user role
    if(adminData.roleId !== 2) {
      return response.status(403).send({
        status: 'error',
        message: 'Account is not allowed!'
      });
    };
    
    // ** admin login audit
    await auditLog({
      userId: adminData.id,
      request: {
        username: request.body.username,
        password: hashPassword(request.body.password)
      },
      response: null,
      channel: 'web',
      url: request.originalUrl,
      device: request.get('User-Agent'),
      ipAddress: request.ip,
      action: 'adminLogin'
    });

    return response.send({
      data: {
        accessToken: accessToken(adminData.id),
        refreshToken: refresToken(adminData.id),
        admin: adminData
      },
      status: 'success',
      message: 'Login authentication was successful!'
    });

  } catch (error) {  
    return response.status(500).send({
      status: 'error',
      message: "An error occured trying to log in."
    })
  }
};

/**
 * Display a list of the resource.
 *
 * @return Response
 */
exports.adminDetail = async (request, response) => {
  try {
    return response.status(200).send({
      status: 'success',
      data: request.authAdmin
    })
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.dashboard = async (request, response) => {
  try {
    const countUsers = await User.count();

    const cashInflow = await transaction.sum('amount', { 
      where: { 
        statusId: 2
      } 
    });
    
    const cashOutflow = await transaction.sum('amount', { 
      where: { 
        statusId: 2
      } 
    });

    const data = {
      countUsers: countUsers,
      cashInflow: cashInflow,
      cashOutflow: cashOutflow
    }
    return response.send({
      data: data,
      status: 'success',
      message: 'Dashboard records have been retrieved successfully!'
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Update a listing of the resource.
 *
 * @return Response
 */
 exports.suspendUser = async (request, response) => {
  try {
    await user.findOne({  
      where: {
        id: request.body.id
      },
      attributes: [
        'id', 
        'blocked'
      ]
    }).then(function (result) {
      result.update({
        blocked: request.body.blocked
      });
      return response.status(200).send({
        status: 'success',
        message: 'User account status has been updated successfuly!'
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
 * Display a listing of the resource.
 *
 * @return Response
 */
exports.fetchUsers = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await user.findAndCountAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id', 
        'email',
        'firstname',
        'lastname',
        'phone',
        'gender',
        'blocked'
      ],
      limit: limit, 
      offset: offset
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'Users have been retrievd successfuly!'
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
 * Display the specified resource.
 *
 * @param  int  $id
 * @return Response
 */
exports.fetchUser = async (request, response) => {
  try {
    await user.findOne({
      where: {
        id: request.query.id
      },
      attributes: [
        'id', 
        'firstname', 
        'lastname',
        'email',
        'emailVerifiedAt',
        'phone', 
        'phoneVerifiedAt',
        'dob',
        'gender'
      ],
      // include: {
      //   model: UserWallet,
      //   as: 'defaultWallet',
      //   required: true,
      //   attributes: [
      //     'isDefault'
      //   ],
      //   include: {
      //     model: Wallet,
      //     attributes: [
      //       'id',
      //       'name' 
      //     ],
      //     include: {
      //       model: Balance,
      //       as: 'currentBalance',
      //       where: {
      //         userId: request.params.id,
      //         status: true
      //       },
      //       attributes: [
      //         'current' 
      //       ]
      //     }
      //   }
      // }
    }).then(function (result) {  
      return response.status(200).send({
        data: result,
        status: 'success',
        message: 'Customer profile retrieved successfuly!'
      });
    });
  } catch (error) {  
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
};

// //= ====================================
// //  WALLET CONTROLLER
// //-------------------------------------- 
/**
 * Display a listing of the resource.
 *
 * @return Response
 */
 exports.fetchWithdrawals = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await transaction.findAndCountAll({
      limit: limit, 
      offset: offset,
      where: {
        status: 'pending'
      },
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id',
        'serviceId',
        'reference',
        'amount',
        'type',
        'status'
      ],
      include: [{
        model: service, 
        required: true,
        attributes: [
          'id',
          'name'
        ] 
      },
      {
        model: user, 
        required: true,
        attributes: [
          'id',
          'firstname',
          'lastname'
        ]
      }]
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'Withdrawal list have been retrieved successfully!'
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
 * Display a listing of the resources.
 *
 * @return Response
 */
exports.withdraw = async (request, response) => {
  try {
    await withdraw.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id', 
        'transactionId', 
        'bankAccountId', 
        'amount'
      ],
      include: [{
        model: Transaction,
        attributes: [
          'id', 
          'reference', 
          'orderNumber', 
          'status'
        ],
        where: {
          status: 'pending'
        },
        include: [
          {
            model: user,
            attributes: [
              'id', 
              'firstname', 
              'lastname'
            ]
          }
        ]},
        {
          model: bankAccount,
          attributes: [
            'id', 
            'bankName', 
            'accountNumber'
          ]
        }
      ] 
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Withdraw have been retrieved successfuly!'
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
 * Update the specified resource in storage.
 *
 * @param  Request  $request
 * @param  string  $id
 * @return Response
 */
 exports.updateWithdrawal = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      id: 'required',
      status: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(401).send(
        validation.errors.all()
      )
    }
    await transaction.findOne({
      where: {
        id: request.body.id,
        status: 'pending'
      },
    }).then(async function (result) {
      result.update({
        status: request.body.status
      });
      // ** admin updateWithdrawal audit
      await auditLog({
        userId: request.authAdmin.adminData.id,
        request: {
          ...request.body
        },
        response: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'updateWithdrawal'
      });
      return response.status(200).send({
        status: 'success',
        message: 'Withdrawal have been updated successfully!'
      });
    });
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

//= ====================================
//  TRANSACTION CONTROLLER
//--------------------------------------
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
      order: [
        ['updatedAt', 'DESC']
      ],
      attributes: [
        'id',
        'serviceId',
        'reference', 
        'amount', 
        'type',
        'narration',
        'imageUrl',
        'status',
        'createdAt'
      ],
      include: [{
        model: service, 
        required: true,
        attributes: [
          'id',
          'name'
        ] 
      },
      {
        model: user, 
        required: true,
        attributes: [
          'id',
          'firstname',
          'lastname'
        ] 
      }] 
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
        status: 'success',
        message: 'Transaction has been retrived successfuly!'
      })
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
exports.fetchTransactionsDetails = async (request, response) => {
  try {
    await transaction.findOne({ 
      where: {
        id: request.query.id
      },
      attributes: [
        'id',
        'serviceId',
        'reference', 
        'amount', 
        'type',
        'narration',
        'imageUrl',
        'status',
        'createdAt'
      ],
      include: [{
        model: service, 
        required: true,
        attributes: [
          'id',
          'name'
        ] 
      },
      {
        model: user, 
        required: true,
        attributes: [
          'id',
          'firstname',
          'lastname'
        ] 
      },
      {
        model: bankAccount, 
        required: false,
        attributes: [
          'id',
          'bankName',
          'accountNumber',
          'accountName'
        ] 
      }] 
    }).then(function (result) {
      return response.status(200).send({
        data: result,
        status: 'success',
        message: 'Transaction details has been retrived successfuly!'
      })
    }); 
  } catch (error) { console.log(error)
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured try, again later.'
    })
  }
};

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */
exports.updateTransactionStatus = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      id: 'required',
      status: 'required',
      amount: 'required',
      userId: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
     
    const userData = await user.findOne({ 
      where: {
        id: request.body.userId
      }
    });

    if (request.body.status === "success" && (request.body.service === "Trade Bitcoin" || request.body.service === "Trade USDT")) {

      const walletbalance = await balance.findOne({
        where: {
          userId: request.body.userId,
          status: true
        }
      });

      walletbalance.update({
        status: false
      });

      const balanceData = await balance.create({
        userId: request.body.userId,
        previous: walletbalance.current,
        book: 0.00,
        current: (parseFloat(walletbalance.current)) + (parseFloat(request.body.amount)),
        status: true
      });

      const transData = await transaction.findOne({  
        where: {
          id: request.body.id,
          userId: request.body.userId
        }
      });

      transData.update({
        status: request.body.status,
        balanceId: balanceData.id
      });
  
      await auditLog({
        userId: request.authAdmin.adminData.id,
        request: {
          ...request.body
        },
        response: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'updateTransactionStatus'
      });

      // ** Send SMS
      const msg = "Your trade has been successfully confirmed, please refresh your dashboard to view your wallet balance";
      await axios.post(`https://account.kudisms.net/api/?username=hammedadewale3366@gmail.com&password=Patriciaogechi@@0&message=${msg}&sender=BitWay.ng&mobiles=${userData.phone}`);
      
      return response.status(201).send({
        status: 'success',
        message: 'Transaction status has been updated successfully!'
      });

    } else if (request.body.status === "success" && request.body.service === "Withdrawal") {

      const transData = await transaction.findOne({  
        where: {
          id: request.body.id,
          userId: request.body.userId
        }
      });

      transData.update({
        status: request.body.status
      });
  
      await auditLog({
        userId: request.authAdmin.adminData.id,
        request: {
          ...request.body
        },
        response: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'updateTransactionStatus'
      });

      // ** Send SMS
      const msg = "Your withdrawal request has been successfully confirmed";
      await axios.post(`https://account.kudisms.net/api/?username=hammedadewale3366@gmail.com&password=Patriciaogechi@@0&message=${msg}&sender=BitWay.ng&mobiles=${userData.phone}`);

      return response.status(201).send({
        status: 'success',
        message: 'Transaction status has been updated successfully!'
      });
    } else if (request.body.status === "failed") {

      const transData = await transaction.findOne({  
        where: {
          id: request.body.id,
          userId: request.body.userId
        }
      });

      transData.update({
        status: request.body.status
      });
  
      await auditLog({
        userId: request.authAdmin.adminData.id,
        request: {
          ...request.body
        },
        response: null,
        channel: 'web',
        url: request.originalUrl,
        device: request.get('User-Agent'),
        ipAddress: request.ip,
        action: 'updateTransactionStatus'
      });
  
      return response.status(201).send({
        status: 'success',
        message: 'Transaction status has been updated successfully!'
      });
    }
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};