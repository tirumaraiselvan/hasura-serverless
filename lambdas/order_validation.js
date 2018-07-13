const { GraphQLClient } = require('graphql-request');

// Graphql client init
const client = new GraphQLClient('http://35.232.191.22/v1alpha1/graphql', {
    headers: {
        Authorization: 'Bearer my-jwt-token',
    },
});

const orderValidateQuery=`
mutation ($order_id: String!, $is_valid: Boolean!){
  update_orders(where: {order_id:{_eq: $order_id}}, _set: {order_valid: $is_valid}) {
    returning {
      order_id
    }
  }
}
`;

function validate(order_id, is_valid){
    var variables = {order_id: order_id, is_valid: is_valid };
    client.request(orderValidateQuery, variables)
        .then(data => {
            console.log("validation done");
            console.log(JSON.stringify(data, null, 2));
        })
        .catch(err => {
            console.log("could not validate");
        });
}

function performValidation(order){
    return true;
}

exports.validateFunc = (event, callback) => {
    const pubsubMessage = event.data;

    validateReqStr = Buffer.from(pubsubMessage.data, 'base64').toString();
    validateReq = JSON.parse(validateReqStr);
    console.log(validateReq);

    is_valid = performValidation(validateReq);

    validate(validateReq.order_id, is_valid);

    callback();
};
