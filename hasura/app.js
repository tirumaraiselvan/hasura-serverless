const { GraphQLClient } = require('graphql-request');
const Hasura = require('./index');
const PubSub = require('@google-cloud/pubsub');

// Google pubsub client init
const projectId = 'danava-test';
const pubsubClient = new PubSub({
    projectId: projectId,
});
const assignDriverTopicName = 'projects/danava-test/topics/swiggy-graphql-serverless-assigndriver';
const orderValidateTopicName = 'projects/danava-test/topics/swiggy-graphql-serverless-validateorder';

// Graphql client init
const client = new GraphQLClient('http://35.232.191.22/v1alpha1/graphql', {
  headers: {
    Authorization: 'Bearer my-jwt-token',
  },
});

// TODO use is_null
const subscribeUnvalidatedOrdersQuery = `
query{
  orders(where: {order_valid: {_neq: true}}){
    order_id
    order_valid
  }
}
`;

const subscribeDriversQuery = `
query {
  orders(where: {approved: {_eq: true}, driver_assigned: {_eq: false}}){
    order_id
    address
    restaurant_id
  }
}
`;

function publishEvent(payload, topic){
	var data = JSON.stringify(payload);
  var dataBuffer = Buffer.from(data);

  pubsubClient
      .topic(topic)
      .publisher()
      .publish(dataBuffer)
      .then(messageId => {
          console.log(`Message ${messageId} published.`);
      })
      .catch(err => {
          console.error('Error publishing event:', err);
      });
}

function run() {
  var dataKey = "orders";
  var variables = {};

  const driversSubscriber = Hasura.subscribe(client, subscribeDriversQuery, variables, dataKey);
  driversSubscriber.start();
  driversSubscriber.events.on('data', data => {
    console.log("got event");
    console.log(JSON.stringify(data, null, 2));
    console.log("scheduling driver assignment...");
    publishEvent(data, assignDriverTopicName);
  });

    const orderValidateSubscriber = Hasura.subscribe(client, subscribeUnvalidatedOrdersQuery, variables, dataKey);
  orderValidateSubscriber.start();
  orderValidateSubscriber.events.on('data', data => {
      console.log("got event");
      console.log(JSON.stringify(data, null, 2));
      console.log("scheduling order validation...");
      publishEvent(data, orderValidateTopicName);
  });
}

run();
