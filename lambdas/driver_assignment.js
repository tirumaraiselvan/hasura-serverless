const { GraphQLClient } = require('graphql-request');

const drivers = [95, 96, 97, 98, 99, 100];

// Graphql client init
const client = new GraphQLClient('http://35.232.191.22/v1alpha1/graphql', {
    headers: {
        Authorization: 'Bearer my-jwt-token',
    },
});


function getRandomDriver() {
  return drivers[Math.floor(Math.random() * 5)];
}

const assignDriverQuery = `
mutation ($order_id: String!, $driver_id: Int!){
  insert_assignment(objects: [{
    order_id: $order_id
    driver_id: $driver_id
  }]){
    returning{
      order_id
      driver_id
    }
  },
  update_orders(where: {order_id:{_eq: $order_id}}, _set: {driver_assigned:true} ){
    returning{
      order_id
    }
  }
}
`;

function assignDriver(order_id, driver_id){
  var variables = {order_id: order_id, driver_id: driver_id};
  client.request(assignDriverQuery, variables)
      .then(data => {
          console.log("driver assigned");
          console.log(JSON.stringify(data, null, 2));
      })
      .catch(err => {
          console.log("error assigning order");
      });
}

exports.assignFunc = (event, callback) => {
  const pubsubMessage = event.data;

  assignReqStr = Buffer.from(pubsubMessage.data, 'base64').toString();
  assignReq = JSON.parse(assignReqStr);
  console.log(assignReq);
  driver = getRandomDriver();
  assignDriver(assignReq.order_id, driver);

  callback();
};
