const { query } = require('graphqurl');

MUTATION_MARK_ORDER_VALIDATED = `
mutation orderValidated($id: uuid!) {
  insert_order_validation(objects:[{
    is_validated: true,
    order_id: $id
  }], on_conflict: {
    action: ignore,
    constraint: order_validation_pkey
  }) {
    affected_rows
    returning {
      validated_at
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
  const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://hge-et-demo.herokuapp.com/v1alpha1/graphql';

  const { id, event: {op, data}, table } = req.body;
  console.log(`processing event ${id}`);

  if (op === 'INSERT' && table.name === 'order') {
    // get the order id
    const order_id = data.new.id;

    // execute the validation logic
    const status = await validate_order(order_id);
    if (status !== true) {
      res.status(500);
      res.json({error: true, data: 'validation failed'});
      return;
    }

    // once the validation is complete, write back the status
    try {
      const mutationResponse = await query({
        endpoint: HGE_ENDPOINT,
        query: MUTATION_MARK_ORDER_VALIDATED,
        variables: { id: order_id },
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

validate_order = (id) => {
  // do the order validation logic here
  // e.g. contact 3rd party APIs etc.
  // should check if the order is already validated
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 10);
  });
};
