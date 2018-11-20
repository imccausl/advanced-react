import React, { Component } from 'react'
import { Query } from 'react-apollo'
import PropTypes from 'prop-types'
import Link from 'next/link'
import gql from 'graphql-tag'

import formatMoney from '../lib/formatMoney'
import { CURRENT_USER_QUERY } from './User'

import Title from './styles/Title'
import ItemStyles from './styles/ItemStyles'
import PriceTag from './styles/PriceTag'
import DeleteItem from './DeleteItem'
import AddToCart from './AddToCart'

class Item extends Component {
  static propTypes = {
    item: PropTypes.shape({
      title: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    }),
  }

  state = {}

  render() {
    const { item } = this.props
    return (
      <ItemStyles>
        {item.image && <img src={item.image} alt={item.title} />}

        <Title>
          <Link
            href={{
              pathname: '/item',
              query: { id: item.id },
            }}
          >
            <a>{item.title}</a>
          </Link>
        </Title>
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>

        <Query query={CURRENT_USER_QUERY}>
          {({ data }) => {
            let isOwner = false
            let hasEditPermission = false
            let hasDeletePermission = false

            if (data.me) {
              isOwner = data.me.id === item.user.id
              hasEditPermission = data.me.permissions.some(permission => ['ADMIN', 'ITEMUPDATE'].includes(permission))
              hasDeletePermission = data.me.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))
            }

            return (
              <div className="buttonList">
                {isOwner || hasEditPermission ? (
                  <Link
                    href={{
                      pathname: '/update',
                      query: { id: item.id },
                    }}
                  >
                    <a>Edit</a>
                  </Link>
                ) : null}
                <AddToCart id={item.id} />
                {isOwner || hasDeletePermission ? (
                  <DeleteItem id={item.id}>Delete Item</DeleteItem>
                ) : null}
              </div>
            )
          }}
        </Query>
      </ItemStyles>
    )
  }
}

export default Item
