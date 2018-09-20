import React from 'react';
import {Table, Button} from 'react-bootstrap';

import {Link} from "react-router-dom";
import gql from "graphql-tag";
import {Subscription} from "react-apollo";
import getStatus from './GetStatus';

const PUBLIC_URL = process.env.PUBLIC_URL;

const GET_ORDERS = gql`
  subscription fetch_orders($user: String!) {
    order(where: {user_name: {_eq: $user}}, order_by: created_at_desc, limit: 20) {
      id
      created_at
      validation {
        is_validated
      }
      payment {
        is_success
      }
      restaurant_approval {
        is_approved
      }
      agent_assignment {
        is_assigned
      }
    }
  }
`;

class MakeAllPayment  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentDone: null,
      loading: null,
      username: props.username,
      error: null,
      message: null
    }
    this.onClick = this.onClick.bind(this);
  }

  onClick () {
    this.setState({loading: true , ...this.state});
    const _this = this;
    fetch('https://us-central1-hasura-serverless.cloudfunctions.net/pay_all',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_name: this.state.username
            })
          })
      .then(res => res.json())
      .catch(err => {
        _this.setState({loading: false, error: err.toString(), ..._this.state});
      })
      .then(response => {
        _this.setState({paymentDone: true, loading: false, message: response.message, ..._this.state});
      });
  }

  render() {
    if (this.state.loading) {
      return (<Button bsStyle="warning" disabled>Loading...</Button>);
    }
    if (this.state.error) {
      return (<Button bsStyle="warning" >Try again: {this.state.error.toString()}</Button>);
    }
    return (
      <Button
        bsStyle="warning"
        onClick={this.onClick}
      >
        {this.state.paymentDone ? 'Paid!' : 'Pay all'}
      </Button>
    );
  }
}

const Orders = ({username}) => (
  <div>
    <h2>Your orders </h2>
    <hr/>
    <MakeAllPayment username={username} />
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
                <Link to={`${PUBLIC_URL}/order/${o.id}`}>{o.id}</Link>
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
