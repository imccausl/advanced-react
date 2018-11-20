import Link from 'next/link'
import { Mutation } from 'react-apollo'

import NavStyles from './styles/NavStyles'
import User from './User'
import SignOut from './Signout'

import { TOGGLE_CART_MUTATION } from './Cart'

const Nav = () => (
  <User>
    {({ data: { me } }) => (
      <NavStyles>
        <Link href="/items">
          <a>Shop</a>
        </Link>

        {!me && (
          <Link href="/signup">
            <a>Sign In</a>
          </Link>
        )}

        {me && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/account">
              <a>
                {me.name.split(' ')[0]}
                {me.name
                  .split(' ')[0]
                  .substr(-1)
                  .toLowerCase() === 's'
                  ? "'"
                  : "'s"}
                {' '}
                Account
              </a>
            </Link>
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {toggleCart => (
                <button type="button" onClick={toggleCart}>
                  My Cart
                </button>
              )}
            </Mutation>
            <SignOut />
          </>
        )}
      </NavStyles>
    )}
  </User>
)

export default Nav
