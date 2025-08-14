import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  if (token) {
    const config = {
      headers: { Authorization: token },
    }
    const request = axios.get(baseUrl, config)
    return request.then((response) => response.data)
  }
  const request = axios.get(baseUrl)
  return request.then((response) => response.data)
}

const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const remove = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const blogUrl = baseUrl.concat(`/${newObject.id.toString()}`)

  await axios.delete(blogUrl, config)
}

const update = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const blogUrl = baseUrl.concat(`/${newObject.id.toString()}`)
  //console.log(blogUrl)

  const response = await axios.put(blogUrl, newObject, config)
  return response.data
}

export default { getAll, setToken, create, update, remove }
