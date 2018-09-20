import React from 'react';
import {Table, Button, Grid} from 'react-bootstrap';

import {Link} from "react-router-dom";
import gql from "graphql-tag";
import {Subscription} from "react-apollo";
import getStatus from './GetStatus';

const PUBLIC_URL = process.env.PUBLIC_URL;

const GET_ORDERS = gql`
  subscription fetch_orders($user: String!, $order_id: uuid! ) {
    order(where: {user_name: {_eq: $user}, id: {_eq: $order_id}}, order_by: created_at_asc) {
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

const OrderStatus = ({username, orderId}) => {
  return (
    <Grid>
      <div>
        <hr/>
        <Subscription
          subscription={GET_ORDERS} variables={{user: username, order_id: orderId}}>
          {({loading, error, data}) => {
            if (loading) return "Loading...";
            if (error) return `Error!: ${JSON.stringify(error)}`;
            if (data.order.length === 0) {
              return "No such order id."
            } else {
              const o = data.order[0];
              return (
                <div>
                  <Table striped hover bordered responsive>
                    <tbody>
                      <tr>
                        <td>Created: </td>
                        <td>
                          {
                            (new Date(o.created_at)).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Id:
                        </td>
                        <td>
                          <Link to={`${PUBLIC_URL}/order/${o.id}`}>{o.id}</Link>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Status:
                        </td>
                        <td>
                          { getStatus(o) }
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <MakePayment order={o} username={username} />
                </div>
              );
            }
          }}
        </Subscription>
        <hr/>
        <Link to={`${PUBLIC_URL}`}><Button bsStyle="danger">Back</Button></Link>
      </div>
    </Grid>
  );
};

class MakePayment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paymentDone: false,
      loading: null,
      error: null,
      order: props.order,
      username: props.username
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick () {
    this.setState({loading: true});
    const _this = this;
    fetch('https://us-central1-hasura-serverless.cloudfunctions.net/make_payment',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            full_name: this.state.username,
            credit_card_number: '1234 1234 1234 1234',
            cvv: '111'
          },
          metadata: {
            amount: 500,
            type: 'credit_card'
          },
          order_id: this.state.order.id
        })
      })
    .then(res => res.json())
    .catch(err => {
      _this.setState({loading: false, error: err.toString()});
    })
    .then(response => {
      _this.setState({paymentDone: true, loading: false, error: null});
    });
  }

  render () {
    if (!(this.props.order.validation && this.props.order.validation.is_validated)) {
      return (
        <Button bsStyle="primary" disabled>Waiting to make payment...</Button>
      )
    }

    if (this.props.order.payment && this.props.order.payment.is_success) {
      return (
        null
      )
    }

    return (
      <div>
        <h4>Card details:</h4>
        <b>Name:</b> {this.props.username}<br/>
        <b>Card number:</b> 1234 1234 1234 1234<br/>
        <b>CVV: </b> 111 <br/>
        <b>Amount: </b> ₹500<br/>
        <br/>
        {this.state.loading ?
          (<Button bsStyle="primary" disabled>Processing payment...</Button>) :
          (this.state.error ?
            (<Button bsStyle="primary" onClick={this.onClick}>Try again: {this.state.error}</Button>) :
            (this.state.paymentDone ?
              (<Button bsStyle="primary" disabled>Done!</Button>) :
              (<Button bsStyle="primary" onClick={this.onClick}>Make payment</Button>)
            )
          )
        }
      </div>
    );
  }
}
export default OrderStatus;
