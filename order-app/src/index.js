import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from "react-apollo";

import App from './App';
import client from './apollo'

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

ReactDOM.render(
  (<ApolloProvider client={client}><App /></ApolloProvider>),
  document.getElementById('root'));
