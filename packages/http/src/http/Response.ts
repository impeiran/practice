import EventEmitter from "events";
import { Socket } from "net";

export class Response extends EventEmitter {
  socket: Socket

  httpVersion = 'HTTP/1.1'

  statusCode = 200

  private headers: Record<string, string> = {
    Connection: 'keep-alive',
    ['Keep-Alive']: 'timeout=5'
  }

  constructor(socket: Socket) {
    super()

    this.socket = socket
  }

  getHeader(name: string) {
    return this.headers[name]
  }

  setHeader(name: string, value: string) {
    this.headers[name] = value
  }

  removeHeader(name: string) {
    delete this.headers[name]
  }

  // http code message
  getStatusMessage() {
    
  }

  get message () {
    if (this.statusCode === 404) {
      return 'No Found'
    } else if (this.statusCode >= 500) {
      return 'Internal Server Error'
    }
    return 'OK'
  }

  end(chunk?: string | Buffer, encoding?: BufferEncoding, callback?: () => void) {
    const responseBodyMessage = !chunk || typeof chunk === 'string'
      ? chunk || ''
      : chunk.toString(encoding)

    const contentLength = Buffer.byteLength(responseBodyMessage)

    this.setHeader('Content-Length', contentLength.toString())
    this.setHeader('Date', new Date().toUTCString())

    const responseHeaderMessage = Object.keys(this.headers).map(name => {
      return `${name}: ${this.headers[name]}`
    })

    const responseMessage = [
      `${this.httpVersion} ${this.statusCode} ${this.message}`,
      ...responseHeaderMessage,
      '',
      responseBodyMessage
    ].join('\r\n')

    console.log(responseMessage)

    this.socket.write(responseMessage)
    this.socket.pipe(this.socket)
    this.socket.end(callback)
  }
}