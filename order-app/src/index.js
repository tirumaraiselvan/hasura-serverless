import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";

const client = new ApolloClient({
  uri: "http://35.232.191.22/v1alpha1/graphql",
  ssrMode: true
});


ReactDOM.render(
  (<ApolloProvider client={client}><App /></ApolloProvider>),
  document.getElementById('root'));
