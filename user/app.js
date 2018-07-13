const { GraphQLClient } = require('graphql-request');
const request = require('request');
const uuidv1 = require('uuid/v1');

const Hasura = require('../hasura');

const restaurants = [1,2,3,4,5];
const items = ["idly", "sambar", "roti", "butter masala", "bhindi", "cheese pizza"];
const userId = process.env.USER_ID || 1;
const address = 'Hasurahalli, Bangalore';

const paymentInfo = {
    "full_name": "tiru selvan",
    "credit_card_number": "45139077221223896219",
    "cvv": "123"
};

const paymentMetadata = {
    "amount": 500,
    "type": "credit_card"
};

// Graphql client init
const client = new GraphQLClient('http://35.232.191.22/v1alpha1/graphql', {
  headers: {
    Authorization: 'Bearer my-jwt-token',
  },
});


const placeOrderQuery = `
mutation ($uuid: String!,
          $user_id: Int!,
          $address: String!,
          $restaurant_id: Int!,
          $item1: String!,
          $item2: String
          ){
  insert_orders(objects: [
  {
    order_id: $uuid
    user_id: $user_id
    address:$address
    restaurant_id: $restaurant_id
  }]){
    returning{
      order_id
    }
  },
  insert_items(objects: [
  {
    order_id: $uuid
    item: $item1
  },
  {
    order_id: $uuid
    item: $item2
  }]){
    returning{
      id
    }
  }
}
`;

const subscribeStatusQuery = `
query ($order_id:String!) {
  orders(where: {order_id: {_eq: $order_id}}) {
    order_id
    restaurant_id
    order_valid
    payment_valid
    placed
    approved
    driver_assigned
    food_picked
    delivered
  }
}
`;

var paymentInitiated = false;

function getRandomRestaurant() {
  return restaurants[Math.floor(Math.random() * 5)];
}

function getRandomItem() {
  return items[Math.floor(Math.random() * 6)];
}

function doPayment(order_id, paymentInfo, paymentMetadata) {
    paymentInitiated = true;
    console.log("initiating payment...");
    request.post(
        'https://us-central1-danava-test.cloudfunctions.net/payment',
        { json: { info: paymentInfo, metadata: paymentMetadata, order_id: order_id } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //response should give url for making payment
                //goto payment url
                console.log(body);
            } else {
                //retry payment
                console.log("error: ", error);
                console.log("status code: ", response.statusCode);
                console.log("response: ", body);
            }
        }
    );
}

//watch
function watchStatus(order_id) {
  var variables = {order_id: order_id};
  var dataKey = "orders";
  const subscriber = Hasura.subscribe(client, subscribeStatusQuery, variables, dataKey);
  subscriber.start();
  subscriber.events.on('data', eventData => {
      console.log("got event");
      var data = eventData.data;
      console.log(data);
      if((data.order_valid == true) && (data.payment_valid == null) && (paymentInitiated == false)){
        doPayment(data.order_id, paymentInfo, paymentMetadata);
    }
  });
}

//place order
function run(){
 var uuid = uuidv1();
  var orderVariables = {
    uuid: uuid,
    user_id: userId,
    address: address,
    restaurant_id: getRandomRestaurant(),
    item1: getRandomItem(),
    item2: getRandomItem()
  };
  client.request(placeOrderQuery, orderVariables)
  .then(data => {
    console.log("order placed: ", data.insert_orders.returning[0].order_id);
    var order_id = data.insert_orders.returning[0].order_id;
    watchStatus(order_id);
  })
  .catch(err => {
    console.log(err.response);
  });
}

run();
