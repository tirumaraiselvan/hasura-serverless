const { GraphQLClient } = require('graphql-request');
const request = require('request');

// Graphql client init
const client = new GraphQLClient('http://35.232.191.22/v1alpha1/graphql', {
    headers: {
        Authorization: 'Bearer my-jwt-token',
    },
});

const callbackUrl = 'https://us-central1-danava-test.cloudfunctions.net/paymentCallback';

const paymentQuery = `
mutation ($order_id: String!, $amount: Int!, $type: String!) {
  insert_payments(objects: [
    {
      order_id: $order_id
      amount: $amount
      type: $type
    }
  ]){
    returning{
      id
      order_id
    }
  }
}
`;

function postToPaymentGateway(payload){
    return true;
}

exports.paymentHandler = (req, res) => {
    var variables = {
        order_id: req.body.order_id,
        amount: req.body.metadata.amount,
        type: req.body.metadata.type
    };
    client.request(paymentQuery, variables)
        .then(data => {
            console.log("validation done");
            console.log(JSON.stringify(data, null, 2));
        })
        .catch(err => {
            console.log("could not validate");
        });

    //response would generally be a bank url for the client
    //in this handler we will emulate bank handler as well
    var response = postToPaymentGateway(req.body);

    if(response) {
      console.log("redirecting to app");
      var url = callbackUrl + '?order_id='+ req.body.order_id;
      request(url, function (error, response, body) {
          console.log('error:', error);
          console.log('statusCode:', response && response.statusCode);
          console.log('body:', body);
      });
      res.status(200).json({message: "payment processed"});
    } else {
        res.status(500).json({error: "couldn't process payment"});
    }
};

