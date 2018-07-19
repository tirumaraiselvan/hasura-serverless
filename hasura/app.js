const { GraphQLClient } = require('graphql-request');
const Hasura = require('./hasura');
const PubSub = require('@google-cloud/pubsub');

const express = require('express');
const app = express();
const fs = require('fs');

const ws = require('ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');

// Google pubsub client init
const projectId = 'danava-test';
const pubsubClient = new PubSub({
    projectId: projectId,
});

const wsurl = process.env.HASURA_WEBSOCKET_URL;

console.log(wsurl);

const client = new SubscriptionClient(
    wsurl, {reconnect: true}, ws
);


const subscribeLiveQueries= `
subscription livequeries {
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
    const subscriptionsSubscriber = Hasura.subscribe(client, subscribeLiveQueries, variables, dataKey);
    subscriptionsSubscriber.start();
    var obs = subscriptionsSubscriber.executable.subscribe(eventData => {
        console.log("got event");
        console.log(JSON.stringify(eventData, null, 2));
        console.log("Clearing existing subscriptions");
        subscribers.forEach(function(sub){
            sub.end();
        });
        eventData.data[dataKey].forEach(sub => {
            console.log("adding subscription with id: ", sub.id);
            var dataKey = sub.data_key;
            var query  = sub.query;
            var variables = {};
            var topicName = sub.topic_name;

            var subscriber = Hasura.subscribe(client, query, variables, dataKey);
            subscriber.start();
            var obs = subscriber.executable.subscribe(eventData => {
                console.log("got event");
                console.log(JSON.stringify(eventData, null, 2));
                eventData.data[dataKey].forEach(data => {
                    publishEvent(data, topicName);
                });
            });
            subscriber.setObservable(obs);
            subscribers.push(subscriber);
        });
    });
    subscriptionsSubscriber.setObservable(obs);
}

if(process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENTS) {
  console.log("Found GOOGLE_APPLICATION_CREDENTIALS_CONTENTS");
  fs.writeFile("credentials.json", process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENTS, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("Google Application Credentials file saved!");
      process.env.GOOGLE_APPLICATION_CREDENTIALS="credentials.json";
      return true;
  });
}

console.log("starting subscription watcher....");

watchNewSubscription();

app.get('/', (req,res) => res.send("Hello hasura client. Check logs for events"));

app.listen(process.env.PORT, () => console.log('App listening !'));
