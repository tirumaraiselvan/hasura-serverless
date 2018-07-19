const { GraphQLClient } = require('graphql-request');

// Graphql client init
const client = new GraphQLClient(process.env.HASURA_HTTP_URL, {
    headers: {
        Authorization: 'Bearer my-jwt-token',
    },
});

const paymentValidQuery = `
mutation ($order_id:String!) {
  update_orders(where:{order_id: {_eq: $order_id}}, _set: {payment_valid: true, placed: true}){
    returning{
      order_id
    }
  }
}
`;

exports.paymentCallbackHandler= (req, res) => {
    var order_id = req.query.order_id;
    console.log("order id: ", order_id);
    var variables = { order_id: order_id };
    client.request(paymentValidQuery, variables)
        .then(data => {
            console.log("payment done");
            console.log(JSON.stringify(data, null, 2));
            res.status(200).json(data);
        })
        .catch(err => {
            console.log("error updating payment status");
            res.status(500).json({error: err});
        });

};
