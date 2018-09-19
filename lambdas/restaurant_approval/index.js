const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://hge-et-demo.herokuapp.com/v1alpha1/graphql';
const MUTATION_RESTAURANT_APPROVAL = `
mutation restaurantApproval(
  $object: restaurant_approval_insert_input!
) {
  insert_restaurant_approval(
    objects: [$object],
    on_conflict: {
      action: ignore,
      constraint: restaurant_approval_pkey
    }
) {
    returning {
      created_at
    }
    affected_rows
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
  const { id, event: {op, data}, table } = req.body;
  console.log(`processing event ${id}`);

  if (op === 'INSERT' && table.name === 'payment') {
    // get the order id
    const order_id = data.new.order_id;

    // execute the restaurant approval logic
    const is_approved = await restaurant_approval(order_id);
    if (!is_approved) {
      res.status(500);
      res.json({error: true, data: 'approval failed'});
      return;
    }

    // once approved, write back the status
    try {
      const mutationResponse = await query({
        endpoint: HGE_ENDPOINT,
        query: MUTATION_RESTAURANT_APPROVAL,
        variables: { object: { order_id, is_approved }},
      });
      res.json({error: false, data: mutationResponse});
    } catch (err) {
      console.error('mutation failed', err);
      res.status(500);
      res.json({error: true, data: err});
    }
  } else {
    res.json({error:false, data: 'did not match conditions, ignoring event'});
  }
};

const restaurant_approval = (id) => {
  // do the restaurant approval logic here
  // typically, this would notify the restaurant and when they accept
  // returns immediately or executes another function which marks status
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 10);
  });
};
