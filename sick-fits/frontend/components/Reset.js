import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { CURRENT_USER_QUERY } from './User'
import Form from './styles/Form'
import Error from './ErrorMessage'

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`

class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired,
  }

  state = {
    password: '',
    confirmPassword: '',
  }

  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { password, confirmPassword } = this.state
    const { resetToken } = this.props

    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{ resetToken, password, confirmPassword }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(requestReset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async (e) => {
              e.preventDefault()
              await requestReset()
              this.setState({ password: '', confirmPassword: '' })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset your password</h2>
              <Error error={error} />
              {!error
                && !loading
                && called && <p>Your password has been reset successfully.</p>}
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Password"
                  value={confirmPassword}
                  onChange={this.saveToState}
                />
              </label>
              <button
                type="submit"
                disabled={called || !(password && confirmPassword)}
              >
                Reset Your Password
              </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Reset
