import styled from 'styled-components'

import CreateAccount from '../components/Signup'
import Signin from '../components/Signin'
import RequestReset from '../components/RequestReset'

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`

const Signup = () => (
  <Columns>
    <CreateAccount />
    <Signin />
    <RequestReset />
  </Columns>
)

export default Signup
