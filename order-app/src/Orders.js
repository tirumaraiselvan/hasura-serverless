import React from 'react';
import {Table, Button} from 'react-bootstrap';

import {Link} from "react-router-dom";
import gql from "graphql-tag";
import {Mutation, Subscription} from "react-apollo";
import getStatus from './GetStatus';

const GET_ORDERS = gql`
  subscription fetch_orders($user: String!) {
    order(where: {user_name: {_eq: $user}}, order_by: created_at_asc) {
      id
      created_at
      validation {
        is_validated
      }
    }
  }
`;

const PAY_ALL = gql`
  mutation payAll($userid: String!) {
    update_orders(_set: {payment_valid: true, placed: true}, where: {
      user_id: {_eq: $userid},
      _or: [
        {payment_valid: {_is_null: true}},
        {placed: {_eq: false}}
      ]}) {
      affected_rows
    }
  }
`;


const Orders = ({username}) => (
  <div>
    <h2>Your orders </h2>
    <hr/>
    <Mutation mutation={PAY_ALL}>
      {(payAll, {loading, error, data}) => {
        if (loading) {
          return (<span><Button bsStyle="warning" disabled>Loading...</Button>&nbsp;&nbsp;</span>);
        }
        if (error) {
          return (<span><Button bsStyle="warning" >Try again: {error.toString()}</Button>&nbsp;&nbsp;</span>);
        }
        return (
          <span>
            <Button
              bsStyle="warning"
              onClick={(e) => {
                payAll({
                  variables: {
                    userid: username
                  }})
              }}>
              {data ? (data.update_orders.affected_rows + ' paid!') : 'Pay all'}
            </Button>&nbsp;&nbsp;
          </span>
        );
      }}
    </Mutation>
    <hr/>
    <Subscription
      subscription={GET_ORDERS} variables={{user: username}}>
      {({loading, error, data}) => {
        if (loading) return "Loading...";
        if (error) return `Error!: ${JSON.stringify(error)}`;
        if (data.order.length === 0) {
          return "No orders yet."
        } else {
          const orders = data.order.map((o, i) => (
            <tr key={i}>
              <td>
                {
                  (new Date(o.created_at)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
              </td>
              <td>
                <Link to={'/order/'+o.id}>{o.id}</Link>
              </td>
              <td>
                {getStatus(o)}
              </td>
            </tr>));
          return (
            <Table striped hover bordered responsive>
              <thead>
                <tr><th>Created</th><th>Order ID</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders}
              </tbody>
            </Table>
          );
        }
      }}
    </Subscription>
    <hr/>
  </div>
);
export default Orders;
