import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import User from './User'
import CartStyle from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'
import CartItem from './CartItem'
import calcTotalPrice from '../lib/calcTotalPrice'
import formatMoney from '../lib/formatMoney'

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`

const Cart = props => (
  <User>
    {({ data: { me } }) => {
      if (!me) return null

      return (
        <Mutation mutation={TOGGLE_CART_MUTATION}>
          {toggleCart => (
            <Query query={LOCAL_STATE_QUERY}>
              {({ data }) => (
                <CartStyle open={data.cartOpen}>
                  <header>
                    <CloseButton onClick={toggleCart} title="close">
                      &times;
                    </CloseButton>
                    <Supreme>
                      {me.name}
                      {me.name.substr(-1).toLowerCase() === 's'
                        ? "'"
                        : "'s"}
                      {' '}
                      Cart
                    </Supreme>
                    <p>
                      You have
                      {' '}
                      {me.cart.length}
                      {' '}
                      {`item${me.cart.length === 1 ? '' : 's'} in your Cart`}
                    </p>
                  </header>
                  <ul>
                    {me.cart.map(cartItem => (
                      <CartItem key={cartItem.id} cartItem={cartItem} />
                    ))}
                  </ul>
                  <footer>
                    <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                    <SickButton>Checkout</SickButton>
                  </footer>
                </CartStyle>
              )}
            </Query>
          )}
        </Mutation>
      )
    }}
  </User>
)
export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }
