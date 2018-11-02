import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import Error from './ErrorMessage'

import { CURRENT_USER_QUERY } from './User'

const SIGN_IN_MUTATION = gql`
  mutation SIGN_UP_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
    }
  }
`

class Signin extends Component {
  state = {
    email: '',
    password: '',
  }

  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { password, email } = this.state

    return (
      <Mutation
        mutation={SIGN_IN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async (e) => {
              e.preventDefault()
              await signin()
              this.setState({ email: '', password: '' })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign In for an Account</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  type="text"
                  name="email"
                  placeholder="email"
                  value={email}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={password}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Sign In</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signin
