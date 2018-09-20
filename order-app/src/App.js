import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import Orders from './Orders';
import PlaceOrder from './PlaceOrder';
import OrderStatus from './OrderStatus';
import {Button, Grid, Jumbotron,
  FormControl, FormGroup, ControlLabel,
  HelpBlock} from 'react-bootstrap';

const PUBLIC_URL = process.env.PUBLIC_URL;

class App extends React.Component {
  constructor (props) {
    super(props);
    const username = window.localStorage.getItem('username');
    this.state = {username};
    this.handleChange = this.handleChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.logout = this.logout.bind(this);
  }

  handleChange (e) {
    this.setState({tempUsername: e.target.value});
  }

  onSave () {
    window.localStorage.setItem('username', this.state.tempUsername);
    this.setState({username: this.state.tempUsername})
  }

  logout () {
    window.localStorage.removeItem('username');
    this.setState({username: undefined})
  }

  render () {
    return (
      <Router>
        <Switch>
          <Route exact path={`${PUBLIC_URL}/`} render={(routeProps) =>
            (<Home routeProps={routeProps} logout={this.logout} username={this.state.username} onChange={this.handleChange} onClick={this.onSave} />)
          } />
          <Route path={`${PUBLIC_URL}/place-order`} render={(routeProps) =>
            (<PlaceOrder routeProps={routeProps} username={this.state.username} />)
          } />
          <Route path={`${PUBLIC_URL}/order/:orderId`} render={({match}) =>
            (<OrderStatus orderId={match.params.orderId} username={this.state.username} />)
          } />
        </Switch>
      </Router>
    );
  }
}

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

const Home = ({username, onChange, onClick, logout}) => {
  if (username) {
    return (
      <Grid>
        <br/>
        <Jumbotron>
          <h1>Hi! {username} <span role="img" aria-label="emoji">🤓</span></h1>
        </Jumbotron>
        <Link to={`${PUBLIC_URL}/place-order`}><Button bsStyle="primary">Place new order</Button></Link>
        &nbsp; &nbsp;
        <Button bsStyle="danger" onClick={logout}>Logout</Button>
        <hr/>
        <Orders username={username} />
      </Grid>
    );
  } else {
    return (
      <Grid>
        <br/>
        <FieldGroup
          id="formControlsText"
          type="text"
          label="Enter username"
          placeholder="username"
          onChange={onChange}
        />
        <Button bsStyle="primary" onClick={onClick}>Enter app</Button>
      </Grid>
    );
  }
}

export default App;
