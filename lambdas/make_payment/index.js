// Serverless function to handle payment request from the client.
// Mocks contacting payment gateway to process the request
// and triggers the payment_callback function to notify success or error
// payment_callback function updates the order with correct status

const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://hge-et-demo.herokuapp.com/v1alpha1/graphql';
const PAYMENT_CALLBACK_URL = process.env.PAYMENT_CALLBACK_URL || '';

/**
 * HTTP Cloud Function.
 * This function is exported by index.js, and is executed when
 * you make an HTTP request to the deployed function's endpoint.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.function = async (req, res) => {
  // handle CORS since this function is triggered from browser
  if (req.method == "OPTIONS") {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(201).send('');
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


};
