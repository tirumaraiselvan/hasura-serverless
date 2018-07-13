import React from 'react';
import {Table} from 'react-bootstrap';

import {Link} from "react-router-dom";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const GET_ORDERS = gql`
  query fetch_orders($user: String!) {
    orders(where: {user_id: {_eq: $user}}, order_by: created_asc) {
      order_id
      order_valid
      payment_valid
      approved
      driver_assigned
      created
    }
  }
`;
const getStatus = ({order_valid, payment_valid, approved, driver_assigned}) => {
  if (!(order_valid)) {
    return 'Validating...';
  } else if (order_valid && !payment_valid) {
    return 'Validating payment...';
  } else if (payment_valid && !approved) {
    return 'Waiting for restaurant...';
  } else if (approved && !driver_assigned) {
    return 'Assigning driver...';
  } else if (driver_assigned) {
    return 'Driver assigned!';
  } else {
    return 'Unknown state';
  }
}

const Orders = ({username}) => (
  <div>
    <h2>Your orders </h2>
    <hr/>
    <Query
      query={GET_ORDERS} variables={{user: username}}>
      {({loading, error, data}) => {
        if (loading) return "Loading...";
        if (error) return `Error!: ${error}`;
        if (data.orders.length === 0) {
          return "No orders yet."
        } else {
          const orders = data.orders.map((o) => (
            <tr>
              <td>
                {
                  (new Date(o.created)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
              </td>
              <td>
                <Link to={'/order/'+o.order_id}>{o.order_id}</Link>
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
    </Query>
    <hr/>
  </div>
);
export default Orders;
