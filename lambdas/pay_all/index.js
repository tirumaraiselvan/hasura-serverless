const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://hge-et-demo.herokuapp.com/v1alpha1/graphql';
const QUERY_GET_UNPAID_ORDERS = `
query getOrders($user_name: String!) {
  order(where: {
    user_name: {_eq: $user_name},
    validation: {is_validated: {_eq: true}},
    _not: {payment: {}}
  }) {
    id
  }
}`;

const MUTATION_INSERT_PAYMENT = `
mutation makePayment($objects: [payment_insert_input!]!) {
  insert_payment(objects:$objects) {
    affected_rows
    returning {
      created_at
    }
  }
}`;

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
    res.status(204).send('');
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  const { user_name } = req.body;

  // get all orders
  let data;
  try {
    const response = await query({
      endpoint: HGE_ENDPOINT,
      query: QUERY_GET_UNPAID_ORDERS,
      variables: { user_name }
    });
    data = response.data;
  } catch (error) {
    res.status(500);
    res.json({error: true, error});
    return;
  }

  if (data.order.length < 1) {
    res.json({error: false, message: 'no orders to pay'});
    return;
  }

  let objects = [];
  data.order.map(({id}) => {
    objects.push({
      order_id: id,
      type: 'credit_card',
      amount: 500,
      is_success: true
    });
  });

  // insert into database
  try {
    const response = await query({
      endpoint: HGE_ENDPOINT,
      query: MUTATION_INSERT_PAYMENT,
      variables: { objects }
    });
    data = response.data;
  } catch (error) {
    res.status(500);
    res.json({error: true, error});
    return;
  }

  res.json({error: false, data});
};
