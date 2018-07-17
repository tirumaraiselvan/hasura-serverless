const { GraphQLClient } = require('graphql-request');
const Hasura = require('./hasura');

const express = require('express');
const app = express();

const restaurantId = process.env.RESTAURANT_ID || 1;

const httpurl = process.env.HASURA_HTTP_URL;

// Graphql client init
const client = new GraphQLClient(httpurl, {
  headers: {
    Authorization: 'Bearer my-jwt-token',
  },
});


const subscribeOrdersQuery = `
query ($rid:Int!){
  orders(where: {placed: {_eq: true}, approved: {_eq: false}, restaurant_id: {_eq: $rid}}){
    order_id
    items{
      item
    }
    address
  }
}
`;

const approveOrderQuery = `
mutation ($order_id: String!) {
  update_orders(_set: {approved: true}, where: {order_id: {_eq: $order_id}}){
    returning{
      order_id
    }
  }
}
`;

function approve(order_id){
  console.log("approving order: ", order_id);
  var variables = {order_id: order_id};
  client.request(approveOrderQuery, variables)
  .then(data => {
      console.log("order approved");
  })
  .catch(err => {
      console.log("error approving order");
  });
}

function run() {
  console.log("starting restaurant id for client: ", restaurantId);
  var variables = {rid: restaurantId};
  var dataKey = "orders";

  const subscriber = Hasura.subscribe(client, subscribeOrdersQuery, variables, dataKey);
  subscriber.start();
  subscriber.events.on('data', eventData => {
      console.log("got event");
      var data = eventData.data;
      console.log(JSON.stringify(data, null, 2));
      var order_id = data.order_id;
      setTimeout(approve, 5000, order_id);
  });
}

run();

app.get('/', (req,res) => res.send("Hello Restaurant app. Check logs for events"));

app.listen(process.env.PORT, () => console.log('App listening !'));
