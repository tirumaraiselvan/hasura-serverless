import React from 'react';
import {Badge} from 'react-bootstrap';

// const icons = {
//   running: <Glyphicon glyph="flash" />,
//   waiting: <Glyphicon glyph="warning-sign" />,
//   done: <Glyphicon glyph="tick" />,
//   notyet: <Glyphicon glyph="more" />,
// };
// const statuses = [
//   {
//     name: 'Order validation'
//   },
//   {
//     name: 'Payment'
//   },
//   {
//     name: 'Restaurant '
//   },
//   {
//     name: 'Driver assigment'
//   },
// ];
export default ({order_valid, payment_valid, approved, driver_assigned}) => {
  // const statusBar = [...statuses];
  if (!(order_valid)) {
    return (<span><Badge>1</Badge> 'Processing order...'</span>);
  } else if (order_valid && !payment_valid) {
    return (<span><Badge>2</Badge> 'Waiting for your payment...'</span>);
  } else if (payment_valid && !approved) {
    return (<span><Badge>3</Badge> 'Waiting for restaurant...'</span>);
  } else if (approved && !driver_assigned) {
    return (<span><Badge>4</Badge> 'Assigning driver...'</span>);
  } else if (driver_assigned) {
    return (<span><Badge>5</Badge> 'Driver assigned!'</span>);
  } else {
    return (<span><Badge>!?!</Badge> 'Unknown state'</span>);
  }
};
