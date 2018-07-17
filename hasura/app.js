const { GraphQLClient } = require('graphql-request');
const Hasura = require('./hasura');
const PubSub = require('@google-cloud/pubsub');

const express = require('express');
const app = express();

// Google pubsub client init
const projectId = 'danava-test';
const pubsubClient = new PubSub({
    projectId: projectId,
});

const httpurl = process.env.HASURA_HTTP_URL;

// Graphql client init
const client = new GraphQLClient(httpurl, {
    headers: {
        Authorization: 'Bearer my-jwt-token',
    },
});


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

console.log("starting subscription watcher....");

watchNewSubscription();

app.get('/', (req,res) => res.send("Hello hasura client. Check logs for events"));

app.listen(process.env.PORT, () => console.log('App listening !'));
