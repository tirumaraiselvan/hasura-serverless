const { query } = require('graphqurl');

const HGE_ENDPOINT = process.env.HGE_ENDPOINT || 'https://hge-et-demo.herokuapp.com/v1alpha1/graphql';
const MUTATION_ASSIGN_AGENT = `
mutation assignAgent(
  $object: agent_assignment_insert_input!
) {
  insert_agent_assignment(
    objects: [$object],
    on_conflict: {
      action: ignore,
      constraint: agent_assignment_pkey
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

  if (op === 'INSERT' && table.name === 'restaurant_approval') {
    // get the order id
    const order_id = data.new.order_id;

    // execute the agent assignment logic
    const { is_assigned, agent_id } = await assign_agent(order_id);
    if (!is_assigned) {
      res.status(500);
      res.json({error: true, data: 'assignment failed'});
      return;
    }

    // once assigned, write back the status
    try {
      const mutationResponse = await query({
        endpoint: HGE_ENDPOINT,
        query: MUTATION_ASSIGN_AGENT,
        variables: { object: { is_assigned, agent_id, order_id }},
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

const assign_agent = (order_id) => {
  // do the agent assignment logic here
  // typically, this would include picking up a free agent and
  // assigning them
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ is_assigned: true, agent_id: newUUID()});
    }, 10);
  });
};

const newUUID = () => {
  const p8 = (s) => {
    let p = (Math.random().toString(16) + "000000000").substr(2 ,8);
    return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
  };
  return p8() + p8(true) + p8(true) + p8();
};
