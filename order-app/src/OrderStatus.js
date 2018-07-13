import React from 'react';
import {Table, Button, Grid} from 'react-bootstrap';

import {Link} from "react-router-dom";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const GET_ORDERS = gql`
  query fetch_orders($user: String!, $order_id: String!) {
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

const OrderStatus = ({username, orderId}) => (
  <Grid>
    <div>
      <hr/>
      <Query
        query={GET_ORDERS} variables={{user: username, order_id: orderId}}>
        {({loading, error, data}) => {
          if (loading) return "Loading...";
          if (error) return `Error!: ${error}`;
          if (data.orders.length === 0) {
            return "No such order id."
          } else {
            const o = data.orders[0];
            return (
              <Table striped hover bordered responsive>
                <tbody>
                  <tr>
                    <td>Created: </td>
                    <td>
                      {
                        (new Date(o.created)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Id:
                    </td>
                    <td>
                      <Link to={'/'}>{o.order_id}</Link>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Status:
                    </td>
                    <td>
                      {getStatus(o)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            );
          }
        }}
      </Query>
      <br/>
      <Link to="/"><Button bsStyle="danger">Back</Button></Link>
    </div>
  </Grid>
);
export default OrderStatus;
