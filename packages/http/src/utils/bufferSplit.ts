export const bufferSplit = (buf: Buffer, splitBuf: Buffer) => {
  const result = []
  
  let search = -1
  do {
    search = buf.indexOf(splitBuf)
    result.push(buf.subarray(0, search))
    buf = buf.subarray(search + splitBuf.length, buf.length)
  } while(search > -1)

  result.push(buf)

  return result
}