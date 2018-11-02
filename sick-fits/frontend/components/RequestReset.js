import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import Error from './ErrorMessage'

const REQUEST_RESET_MUTATION = gql`
  mutation SIGN_UP_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

class Signin extends Component {
  state = {
    email: '',
  }

  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { email } = this.state

    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
        {(requestReset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async (e) => {
              e.preventDefault()
              await requestReset()
              this.setState({ email: '' })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Forgot Password?</h2>
              <Error error={error} />
              {!error
                && !loading
                && called && <p>Success! Check your email for a reset link.</p>}
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
              <button type="submit">Request Reset</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signin
