const express = require('express');
const bodyParser = require('body-parser');
const { GraphQLClient } = require('graphql-request');
const Hasura = require('./index');
const PubSub = require('@google-cloud/pubsub');

// Google pubsub client init
const projectId = 'danava-test';
const pubsubClient = new PubSub({
    projectId: projectId,
});

// Graphql client init
const client = new GraphQLClient('http://35.232.191.22/v1alpha1/graphql', {
  headers: {
    Authorization: 'Bearer my-jwt-token',
  },
});


var app = express();
app.use(bodyParser.json());

const subscribeLiveQueries= `
query {
  subscriptions {
    id
    query
    topic_name
    data_key
  }
}
`;

const insertSubscription = `
mutation ($query: String!, $topic_name:String!, $data_key:String!){
  insert_subscriptions(objects:[
    {
      query: $query
      topic_name: $topic_name
      data_key: $data_key
    }
  ]){
    returning{
      id
    }
  }
}
`;

app.get('/', function (req, res) {
    console.log("listing subscriptions");
    client.request(subscribeLiveQueries)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

app.get('/list', function (req, res) {
    console.log("listing subscriptions");
    client.request(subscribeLiveQueries)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});

app.post('/', function (req, res) {
    console.log("posting subscription");
    var variables = {
        query: req.body.query,
        topic_name: req.body.topic_name,
        data_key: req.body.data_key
    };
    client.request(insertSubscription, variables)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            console.log("error posting subscription");
            res.status(500).json({error: err});
        });
});

app.post('/subscribe', function (req, res) {
    console.log("posting subscription");
    var variables = {
        query: req.body.query,
        topic_name: req.body.topic_name,
        data_key: req.body.data_key
    };
    client.request(insertSubscription, variables)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({error: err});
        });
});


var subscribers = [];
var currentBatchId = "";

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

function watchNewSubscription() {
    var dataKey = "subscriptions";
    var variables = {};
    const liveQuerySubscriber = Hasura.subscribe(client, subscribeLiveQueries, variables, dataKey);
    liveQuerySubscriber.start();
    liveQuerySubscriber.events.on('data', eventData => {
        console.log("got event");
        var batchId = eventData.batchId;
        if (batchId != currentBatchId){
            console.log("clearing existing subscriptions");
            subscribers.forEach(function(sub){
                sub.end();
            });
            currentBatchId = batchId;
        }
        var data = eventData.data;
        console.log("adding subscription with id: ", data.id);
        var dataKey = data.data_key;
        var query  = data.query;
        var variables = {};
        var topicName = data.topic_name;

        var subscriber = Hasura.subscribe(client, query, variables, dataKey);
        subscriber.start();
        subscriber.events.on('data', eventData => {
            console.log("got event");
            var data = eventData.data;
            console.log(JSON.stringify(data, null, 2));
            publishEvent(data, topicName);
        });
        subscribers.push(subscriber);
    });
}

watchNewSubscription();

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Hasura subscribe engine listening at http://%s:%s", host, port);
});



// TODO use is_null
// const subscribeUnvalidatedOrdersQuery = `
// query{
//   orders(where: {order_valid: {_neq: true}}){
//     order_id
//     order_valid
//   }
// }
// `;

// const subscribeDriversQuery = `
// query {
//   orders(where: {approved: {_eq: true}, driver_assigned: {_eq: false}}){
//     order_id
//     address
//     restaurant_id
//   }
// }
// `;



// function run() {
//   var dataKey = "orders";
//   var variables = {};

//   const driversSubscriber = Hasura.subscribe(client, subscribeDriversQuery, variables, dataKey);
//   driversSubscriber.start();
//   driversSubscriber.events.on('data', data => {
//     console.log("got event");
//     console.log(JSON.stringify(data, null, 2));
//     console.log("scheduling driver assignment...");
//     publishEvent(data, assignDriverTopicName);
//   });

//     const orderValidateSubscriber = Hasura.subscribe(client, subscribeUnvalidatedOrdersQuery, variables, dataKey);
//   orderValidateSubscriber.start();
//   orderValidateSubscriber.events.on('data', data => {
//       console.log("got event");
//       console.log(JSON.stringify(data, null, 2));
//       console.log("scheduling order validation...");
//       publishEvent(data, orderValidateTopicName);
//   });
// }

//run();
