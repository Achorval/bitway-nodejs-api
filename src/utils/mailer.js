const axios = require('axios');

// const nodemailer = require("nodemailer");
// const templates = require('../mail/templates');

// const emailTransport = { 
//     default: {
//         service: "smtp-pulse.com",
//         port: 2525,
//         secure: false, 
//         auth: {
//             user: '8aa88c52579d9055ec7d81747d7ec824', 
//             pass: '21204d3fd41d2fc43b71c8cbe0ed3337',
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     }
// } 

// const defaultOptions = {
//     transport: 'default', 
//     options: {from:'', to:'', subject:''}, 
//     text:'', 
//     html: {template:'', vars:{}}
// }

// const sendMail = (options = defaultOptions) => {
//     let transporter = nodemailer.createTransport(emailTransport[options.transport]);
//     let template = templates[options.html.template];
//     let htmlTemplate = template({...options.html.vars});
//     let message = {
//         ...options.options,
//         text: options.text,
//         html: htmlTemplate
//     }

//     return transporter.sendMail(message);
// };

// module.exports = {
//   sendMail
// }


/**
* Return current transaaction pin resources.
*
* @var string $userId
*/
exports.sendPulseAuthorization = async () => {
    return new Promise(async (resolve, reject) => {
        try {
        const result = await axios.post('https://api.sendpulse.com/oauth/access_token', {
            grant_type: 'client_credentials',
            client_id: '8aa88c52579d9055ec7d81747d7ec824',
            client_secret: '21204d3fd41d2fc43b71c8cbe0ed3337'
        } , {
            headers: {
                'content-type': 'application/json'
            }
        });
            // console.log(result.data)
            // return result.data;

            resolve(result.data);
            // resolve(true);
        } catch (e) {
            // return false;
            reject(e)
        }
    });
}