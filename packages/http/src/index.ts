import { createServer } from './http'

const httpServer = createServer((req, res) => {
  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    code: 0,
    data: {
      id: 1,
      time: new Date().getTime()
    }
  }))
})

httpServer.listen(3000, 'localhost', () => {
  console.log('server bound')
})