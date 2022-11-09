
const moment = require('moment');
const jwt = require('jsonwebtoken');
const passwordHash = require('password-hash');
const { auditLog, balance, network, wallet } = require('../models');

const config = {
  accessTokenSecretKey: 'dd5f3089-40c3-403d-af14-d0c228b05cb4',
  refreshTokenSecretKey: '7c4c1c50-3230-45bf-9eae-c9b2e401c767'
};

/**
 * Create a new unique instance.
 *
 * @return unique
 */
// exports.uniqueNumber = () => {
//   var date = moment().format('YYYYMMDDHmmss');
//   const random = Math.floor(Math.random() * 1000000000) + 1; 
//   const unique = date+random;
//   return unique; 
// };

exports.uniqueNumber = (length) => {
  var time = new Date().getTime();
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < length; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return time+result;
}

/**
* Create a slug.
*
* @var string
*/
exports.slug = async (Text) => {
  return Text
  .toLowerCase()
  .replace(/[^\w ]+/g,'')
  .replace(/ +/g,'-')
  ;
};

/**
* Create a Title case.
*
* @var string
*/
exports.titleCase = (str) => {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  return splitStr.join(' '); 
};

/**
* Create a Title case.
*
* @var string
*/
exports.hashPassword = (password) => {
  return passwordHash.generate(password); 
}

/**
* Create a Title case.
*
* @var string
*/
exports.compareHashPassword = (password, hashedPassword) => {
  return passwordHash.verify(password, hashedPassword); 
}

exports.accessToken = (id) => {
  if (id) {
    const ONE_WEEK = 60 * 60 * 24 * 7;
    return jwt.sign({ id: id }, config.accessTokenSecretKey, { expiresIn: ONE_WEEK });  
  }
}

/**
* Create a Title case.
*
* @var string
*/
exports.refresToken = (id) => {
  if (id) {
    const ONE_WEEK = 60 * 60 * 24 * 7;
    return jwt.sign({ id: id }, config.refreshTokenSecretKey, { expiresIn: ONE_WEEK });
  }
};

/**
 * Where to redirect users when the intended url fails.
 *
 * @var string
 */
exports.auditLog = (data) => {
  return auditLog.create(data);
},

/**
* Return current wallet resources.
*
* @var string $userId, label
*/
exports.currentBalance = async (userId, label) => {
  return await balance.findOne({
    attributes: [
      'current',
    ],
    where: {
      userId: userId,
      status: true
    },
    include: {
      model: wallet,
      required: true,
      attributes: [
        'name'
      ],
      where: {
        label: label,
        status: true
      }
    }
  });
}

/**
 * Where to redirect users when the intended url fails.
 *
 * @var string
 */
exports.fetchNetwork = async (id) => {
  try {
    const data = await network.findOne({
      where: {
        id: id
      },
      attributes: [
        'name'
      ]
    });

    if (!data) {
      return res.status(400).send({
        message: 'No record found'
      });
    }

    return data.toJSON().name;

  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
}

/**
 * @function calculateLimitAndOffset
 * @param {number} page page number to get
 * @param {number} pageSize number of items per page/request
 * @returns {object} returns object containing limit and offset
 */
exports.limitAndOffset = (page, pageSize) => {
  const pageAsNumber = (Number.parseInt(page) - 1);
  const limitAsNumber = Number.parseInt(pageSize);

  let offset = 0;
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    offset = pageAsNumber;
  }

  let limit = 15;
  if (!Number.isNaN(limitAsNumber) && limitAsNumber > 0 && limitAsNumber < 15) {
    limit = limitAsNumber;
  }
   
  return { offset, limit };
}

/**
 * @function paginate
 * @param {number} page page number to get
 * @param {number} count total number of items
 * @param {array} rows items
 * @param {number} pageSize number of items per page/request
 * @returns {object} return the meta for pagination
 */
exports.paginate = (rows, page, totalItems, pageSize) => {
  const meta = {
    data: rows,
    currentPage: Number(page) || 1,
    totalPages: Math.ceil(totalItems / Number(pageSize)),
    pageSize: Number(pageSize),
    totalItems: totalItems
  };
  return meta;
};