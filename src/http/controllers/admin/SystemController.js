let Validator = require('validatorjs');
const { 
  slug, 
  paginate,  
  auditLog, 
  limitAndOffset,
} = require("../../../utils/Functions");
const { 
  service
} = require('../../../models');

//= ====================================
//  SERVICE CONTROLLER
//--------------------------------------
/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $request
 * @return Response
 */    
exports.fetchServices = async (request, response) => {
  try {
    const { offset, limit } = limitAndOffset(request.query.page, request.query.perPage);
    await service.findAndCountAll({ 
      order: [
        ['createdAt', 'DESC']
      ], 
      attributes: [
        'id', 
        'name',
        'imageUrl', 
        'url', 
        'color',
        'slug',
        'rate',
        'description',
        'status'
      ],
      limit: limit, 
      offset: offset
    }).then(function (result) {
      return response.status(200).send({
        data: paginate(result.rows, request.query.page, result.count, request.query.perPage),
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
exports.createService = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      name: 'required',
      imageUrl: 'required',
      url: 'required',
      color: 'required',
      rate: 'required',
      description: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
    await service.create({
      name: request.body.name,
      slug: await slug(request.body.name),
      imageUrl: request.body.imageUrl,
      url: request.body.url,
      color: request.body.color,
      rate: request.body.rate,
      description: request.body.description
    });
    // ** admin createService audit
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
      action: 'createService'
    });
    return response.status(201).send({
      status: 'success',
      message: 'Service have been created successfully!'
    }); 
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
exports.editService = async (request, response) => {
  try {
    await service.findOne({
      where: {
        id: request.params.id
      },
      attributes: [
        'id', 
        'productId',
        'name', 
        'imageUrl',
        'url',
        'color',
        'description'
      ] 
    }).then(function (data) {
      return response.status(200).send({
        data: data,
        status: 'success',
        message: 'Service have been edited successfuly!'
      })
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
exports.updateService = async (request, response) => {
  try {
    // Validation rules
    let rules = {
      name: 'required',
      imageUrl: 'required',
      url: 'required',
      color: 'required',
      rate: 'required',
      description: 'required'
    };
    
    let validation = new Validator(request.body, rules);

    if (validation.fails()) {
      return response.status(400).send(
        validation.errors.all()
      )
    }
    await service.findOne({
      where: {
        id: request.params.id
      },
      attributes: [
        'id', 
        'name', 
        'slug',
        'imageUrl',
        'url',
        'color',
        'rate',
        'description'
      ]
    }).then(async function (result) {
      await result.update({
        name: request.body.name,
        slug: await slug(request.body.name),
        imageUrl: request.body.imageUrl,
        url: request.body.url,
        color: request.body.color,
        rate: request.body.rate,
        description: request.body.description
      });
      // ** admin createService audit
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
        action: 'updateService'
      });
      return response.status(200).send({
        status: 'success',
        message: 'Service have been updated successfully!'
      });
    });
  } catch (error) { 
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};

/**
 * Remove the specified resource from storage.
 *
 * @param  string  $id
 * @return Response
 */
exports.deleteService = async (request, response) => {
  try {
    await service.destroy({
      where: {
        id: request.params.id
      }
    });
    return response.status(200).send({
      status: 'success',
      message: 'Service have been deleted successfully!'
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
exports.serviceStatus = async  (request, response) => {
  try {
    if (request.authAdmin) {
      // Validation rules
      let rules = {
        id: 'required',
        status: 'required'
      };
      
      let validation = new Validator(request.body, rules);

      if (validation.fails()) {
        return response.status(400).send(
          validation.errors.all()
        )
      }
      await service.findOne({
        where: {
          id: request.body.id
        },
        attributes: [
          'id',  
          'status',
        ]
      }).then(async function (result) {
        await result.update({
          status: request.body.status
        });
        // ** admin createService audit
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
          action: 'updateServiceStatus'
        });
        return response.status(200).send({
          status: 'success',
          message: 'Service status have been updated successfully!'
        });
      });
    } 
  } catch (error) {
    return response.status(400).send({
      status: 'error',
      message: 'An Error Occured, try again later!'
    });
  }
};
  
