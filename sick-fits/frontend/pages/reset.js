import PropTypes from 'prop-types'

import ResetPassword from '../components/Reset'

const Reset = (props) => {
  const { query } = props
  const { resetToken } = query

  return (
    <div>
      <ResetPassword resetToken={resetToken} />
    </div>
  )
}

Reset.propTypes = {
  query: PropTypes.shape({
    resetToken: PropTypes.string.isRequired,
  }).isRequired,
}

export default Reset
