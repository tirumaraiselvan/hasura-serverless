import React, { Component } from 'react';
import './App.css';

import gql from "graphql-tag";
import {Subscription } from "react-apollo";

import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-client";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';


const wsLink = new WebSocketLink({
  uri: "wss://35.232.191.22/v1alpha1/graphql",
  options: {
    reconnect: true
  }
});
const httpLink = new HttpLink({
  uri: "https://35.232.191.22/v1alpha1/graphql",
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});


var LineChart = require("react-chartjs").Line;
var chartData = {
    labels: [1,1],
    datasets: [
        {
            label: "Placed",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(200,50,100,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(200,50,100,1)",
            data: [5,5]
        },
        {
            label: "Validated",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(150,100,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(150,100,100,1)",
            data: [4,4]
        },
        {
            label: "Paid",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(100,150,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(100,150,100,1)",
            data: [3,3]
        },
        {
            label: "Approved",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(50,200,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(50,200,100,1)",
            data: [2,2]
        },
        {
            label: "Assigned",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(0,200,100,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(0,200,100,1)",
            data: [1,1]
        }
    ]
};

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <Subscription
            subscription={gql`
              subscription {
                number_orders {
                  count
                }
                number_order_validated {
                  count
                }
                number_order_payment_valid {
                  count
                }
                number_order_approved {
                  count
                }
                number_order_driver_assigned {
                  count
                }
              }
            `}>

            {({ loading, error, data }) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <p>Error :(</p>;

              chartData.datasets[0].data.push(data.number_orders[0].count);
              chartData.datasets[1].data.push(data.number_order_validated[0].count);
              chartData.datasets[2].data.push(data.number_order_payment_valid[0].count);
              chartData.datasets[3].data.push(data.number_order_approved[0].count);
              chartData.datasets[4].data.push(data.number_order_driver_assigned[0].count);
              chartData.labels.push(1);
              return (
                <LineChart data={chartData}
                  options={{responsive: true, maintainAspectRatio: false,
                    scales: {
                      xAxes: [{ labels: { userCallback: () => ('') } }]
                    }
                  }}
                  />
              );
            }}
          </Subscription>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
