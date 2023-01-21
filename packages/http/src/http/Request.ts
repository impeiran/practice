import EventEmitter from "events"
import { Socket } from "net"
import { bufferSplit } from "../utils/bufferSplit"

export class Request extends EventEmitter {
  socket: Socket

  httpVersion: string = ''

  url: string = '/'

  method?: string

  headers: Record<string, string | undefined> = {}

  constructor(socket: Socket, data: Buffer) {
    super()

    this.socket = socket

    const requestBufferArray = this.sliceDataBuffer(data)
    const [head] = requestBufferArray
    const headers = requestBufferArray.slice(1, -2)
    const body = requestBufferArray.pop()

    this.deserializeHead(head)
    this.deserializeHeaders(headers)

    if (body) {
      this.emit('data', body)
    }
  }

  sliceDataBuffer(data: Buffer) {
    // http use '\r\n' split head, headers, body
    const requestBufferArray: Buffer[] = bufferSplit(data, Buffer.from('\r\n'))
    return requestBufferArray
  }

  deserializeHead(buffer: Buffer) {
    const [method, url, httpVersion] = buffer.toString().split(/\s/)

    this.httpVersion = httpVersion
    this.method = method
    this.url = url
  }

  deserializeHeaders(buffer: Buffer[]) {
    this.headers = buffer.reduce<Record<string, any>>((result, item) => {
      const headerKeyValueString = item.toString()
      if (headerKeyValueString) {
        const [key, value] =headerKeyValueString.split(': ')
        if (!result[key]) {
          result[key] = value
        } else if (Array.isArray(result[key])) {
          // maybe it comes lots of line with same header
          result[key].push(value)
        } else {
          result[key] = [result[key]]
          result[key].push(value)
        }
      }
      return result
    }, {})
  }
}