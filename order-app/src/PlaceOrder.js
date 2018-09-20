import React from 'react';
import {Grid, Checkbox, Button} from 'react-bootstrap';
import {Link} from "react-router-dom";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";

const uuidv1 = require('uuid/v1');

const PUBLIC_URL = process.env.PUBLIC_URL;

const GET_ITEMS= gql`
  query fetch_items {
    item (order_by: name_asc) {
      id
      name
    }
  }
`;

const PLACE_ORDER = gql`
  mutation (
    $uuid: uuid!,
    $order_items: [order_item_insert_input!]!,
    $user_name: String!
  ) {
    insert_order(objects: [{
      id: $uuid
      user_name: $user_name
    }]) {
      returning {
        id
        created_at
      }
    },

    insert_order_item(objects: $order_items) {
      returning {
        order_id
        item_id
      }
    }
  }
`;

const PLACE_MANY_ORDERS = gql`
  mutation ($orders: [order_insert_input!]!, $items: [order_item_insert_input!]!) {
    insert_order(objects: $orders) {
      returning {
        id
      }
    },

    insert_order_item(objects: $items) {
      affected_rows
    }
  }
`;


class PlaceOrder extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      ordered: false,
      uuid: uuidv1(),
      items: {}
    };
    this.onClick = this.onClick.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
  }

  onClick () {
    this.setState({ordered: true});
  }

  handleChanged (item_id) {
    const _this = this;
    return ((e) => {
      _this.setState({items: {..._this.state.items, [item_id]: e.target.checked}});
    });
  }

  render () {
    let innerComponent;

    // If not ordered yet
    if (!this.state.ordered) {
      innerComponent = (
        <Grid>
          <br/>
          <div>
            <h4>Choose items:</h4>
            <hr/>
            <Query query={GET_ITEMS}>
              {({loading, error, data}) => {
                if (loading) return "Loading items...";
                if (error) return `Error!: ${error}`;
                return data.item.map((item, i) => (
                  <Checkbox key={i} onChange={this.handleChanged(item.id)}>{item.name}</Checkbox>
                ));
              }}
            </Query>
            <hr/>
            <Mutation mutation={PLACE_ORDER}>
              {(placeOrder, {loading, error, data}) => {
                if (data) {
                  this.props.routeProps.history.push(`${PUBLIC_URL}/order/${this.state.uuid}`);
                }
                if (loading) {
                  return (<span><Button bsStyle="primary" disabled>Loading...</Button>&nbsp;&nbsp;</span>);
                }
                if (error) {
                  return (<span><Button bsStyle="primary" >Try again: {error.toString()}</Button>&nbsp;&nbsp;</span>);
                }
                const items = Object.keys(this.state.items).filter((item) => (
                  this.state.items[item]
                )).map((item) => (
                  {
                    order_id: this.state.uuid,
                    item_id: item
                  }));

                return (
                  <span>
                    <Button
                      bsStyle="primary"
                      onClick={(e) => {
                        if (items.length === 0) {
                          window.alert('No items selected.');
                          return;
                        }
                        placeOrder({
                          variables: {
                            uuid: this.state.uuid,
                            order_items: items,
                            user_name: this.props.username
                          }})
                      }}>
                      Order
                    </Button>&nbsp;&nbsp;
                  </span>
                );
              }}
            </Mutation>
            <Mutation mutation={PLACE_MANY_ORDERS}>
              {(placeOrder, {loading, error, data}) => {
                if (data) {
                  this.props.routeProps.history.push(`${PUBLIC_URL}`);
                }
                if (loading) {
                  return (<span><Button bsStyle="primary" disabled>Loading...</Button>&nbsp;&nbsp;</span>);
                }
                if (error) {
                  return (<span><Button bsStyle="primary" >Try again: {error.toString()}</Button>&nbsp;&nbsp;</span>);
                }
                const items = Object.keys(this.state.items).filter((item) => (
                  this.state.items[item]
                )).map((item) => (
                  {
                    order_id: this.state.uuid,
                    item
                  }));

                const username = this.props.username;
                const orders = [...Array(1000).keys()].map(() => ({
                  order_id: uuidv1(),
                  user_name: username
                }));
                let all_items = orders.map((o) => (
                  items.map((i) => ({
                    order_id: o.order_id,
                    item_id: i.item
                  }))));
                all_items = [].concat.apply([], all_items);
                return (
                  <span>
                    <Button
                      bsStyle="primary"
                      onClick={(e) => {
                        if (items.length === 0) {
                          window.alert('No items selected.');
                          return;
                        }
                        placeOrder({
                          variables: {
                            items: all_items,
                            orders: orders
                          }})
                      }}>
                      Order 1000 times
                    </Button>&nbsp;&nbsp;
                  </span>
                );
              }}
            </Mutation>
            <Link to={`${PUBLIC_URL}`}><Button bsStyle="danger">Cancel</Button></Link>
          </div>
        </Grid>
      );
    }

    // order placed
    else {
      innerComponent = "Order placed";
    }

    return (
      <Grid>
        <br/>
        {innerComponent}
      </Grid>
    );
  }
}
export default PlaceOrder;
