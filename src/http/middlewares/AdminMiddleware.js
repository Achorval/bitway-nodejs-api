const jwt = require('jsonwebtoken');
const { user } = require('../../models');
const { accessToken, refresToken } = require("../../utils/Functions");

const config = {
  accessTokenSecretKey: 'dd5f3089-40c3-403d-af14-d0c228b05cb4',
  refreshTokenSecretKey: '7c4c1c50-3230-45bf-9eae-c9b2e401c767'
};

exports.adminMiddleware = (request, response, next) => {
  try {
    const bearerHeader = request.headers.authorization;
    if (bearerHeader) {
      const ONE_WEEK = 60 * 60 * 24 * 7;
      const token = bearerHeader.split(' ')[1];
      jwt.verify(token, config.accessTokenSecretKey, { expiresIn: ONE_WEEK }, (err, decoded) => {
        if (decoded) {
          user.findOne({
            where: {
              id: decoded.id
            },
            attributes: [
              'id', 
              'firstname', 
              'lastname',
              'email',
              'isEmailVerified',
              'phone', 
              'isPhoneVerified',
              'dob',
              'gender',
              'bvn',
              'isBvnVerified', 
              'isDocumentVerified',
              'balanceStatus',
              'blocked'
            ], 
          }).then(function (adminData) {
            request.authAdmin = {
              accessToken: accessToken(adminData.id),
              refreshToken: refresToken(adminData.id),
              adminData,
            },
            next();
          });
        } else if (err.message === 'jwt expired') {
          return response.status(403).send({
            error: true,
            message: "Access token expired!"
          });
        } else {
          return response.status(403).send({
            error: true,
            message: "Unauthorized!"
          });
        }
      });
  } else {
      return response.status(403).send({
        error: true,
        message: "No token provided!"
      });
    };
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later'
    })
  }
}
    




