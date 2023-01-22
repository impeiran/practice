import { createServer as createTcpServer } from 'net'
import { Request } from './Request'
import { Response } from './Response'

export type ServerListener = (req: Request, res: Response) => void

class Http {
  static createServer(serverListener: ServerListener) {
    const server = createTcpServer((socket) => {
      socket.on('data', (data) => {
        const req = new Request(socket, data)
        const res = new Response(socket)
        serverListener(req, res)
      })
    })
  
    return server
  }
}

export const createServer = Http.createServer