import { useState } from 'react'
import { Table, Form, Button } from 'react-bootstrap'

const Login = ({ doLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (event) => {
    event.preventDefault()
    doLogin({ username, password })
    setUsername('')
    setPassword('')
  }

  const margin = {
    marginTop: 15
  }

  return (
    <Form onSubmit={handleLogin}>
      <Form.Group>
        <Form.Label>
          Username:
          <Form.Control
            type="text"
            data-testid='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)} />
        </Form.Label>
      </Form.Group>
      <Form.Group>
        <Form.Label>
          Password:
          <Form.Control
            type="password"
            value={password}
            data-testid='password'
            onChange={(e) => setPassword(e.target.value)} />
        </Form.Label>
      </Form.Group>
      <Button style={margin} type="submit">Login</Button>
    </Form>
  )
}

export default Login