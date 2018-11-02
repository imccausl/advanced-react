import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Error from './ErrorMessage'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }

  }
`

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      description
      price
    }
  }
`

class UpdateItem extends Component {
  state = {};

  handleChange = (e) => {
    const { name, type, value } = e.target
    const val = type === 'number' ? parseFloat(value) : value

    this.setState({ [name]: val })
  }

  updateItem = async (e, updateItemMutation) => {
    e.preventDefault()

    console.log('Updating item...')
    console.log(this.state)

    const res = await updateItemMutation({
      variables: {
        id: this.props.id,
        ...this.state,
      },
    })

    console.log('Updated!')
  }

  // uploadFile = async (e) => {
  //   const { files } = e.target
  //   const data = new FormData()

  //   data.append('file', files[0])
  //   data.append('upload_preset', 'sickfits')

  //   const res = await fetch('https://api.cloudinary.com/v1_1/dyvcwu48b/image/upload', {
  //     method: 'POST',
  //     body: data,
  //   })

  //   const file = await res.json()
  //   console.log(file)

  //   this.setState({
  //     image: file.secure_url,
  //     largeImage: file.eager[0].secure_url,
  //   })
  // }

  render() {
    const {
      title, price, description,
    } = this.state

    const { id } = this.props

    return (
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{
          id,
        }}
      >
        {
        ({ data, loading }) => {
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>No item found!</p>

          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form
                  onSubmit={
                    e => this.updateItem(e, updateItem)
                  }
                >
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    {
                // <label htmlFor="image">
                //   Image
                //   <input
                //     type="file"
                //     id="file"
                //     name="image"
                //     placeholder="Upload a file"
                //     required
                //     onChange={this.uploadFile}
                //   />
                //   {image && <img src={image} alt="Upload preview" />}
                // </label>
              }

                    <label htmlFor="title">
              Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="price">
              Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>
                    <label htmlFor="description">
              Description
                      <textarea
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Enter a description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>
                    <button type="submit">
                      Sav
                      {loading ? 'ing' : 'e'}
                      {' '}
                      Changes
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default UpdateItem
export { UPDATE_ITEM_MUTATION }
