const URI = require('urijs')
const fs = require('fs')
const mime = require('mime')
const debug = require('debug')('butter-streamer-file')

var Streamer = require('butter-streamer')

const config = {
  name: 'Simple File Streamer',
  protocol: /file/,
  type: 'file',
  priority: 10
}

class FileStreamer extends Streamer {
  constructor (source, options) {
    if (URI(source).protocol() === 'file') {
      source = URI(source).path()
    }
    super(source, options, config)
  }

  createStream (source, opts) {
    return new Promise((resolve, reject) => (
      fs.stat(source, (err, stats) => {
        if (err) reject(err)

        this.stats = stats
        debug('stats', stats)

        const file = {
          name: source.split('/').pop(),
          type: mime.getType(source),
          length: stats.size - opts ? opts.start : 0
        }

        resolve({
          stream: fs.createReadStream(source, opts),
          file
        })
      })
    ))
  }
}

module.exports = FileStreamer
