import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-client";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';


const wsLink = new WebSocketLink({
  uri: "ws://35.232.191.22/v1alpha1/graphql",
  options: {
    reconnect: true
  }
});
const httpLink = new HttpLink({
  uri: "http://35.232.191.22/v1alpha1/graphql",
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

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

ReactDOM.render(
  (<ApolloProvider client={client}><App /></ApolloProvider>),
  document.getElementById('root'));
