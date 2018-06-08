const URI = require('urijs')
const fs = require('fs')
const mime = require('mime')
const EventEmitter = require('events').EventEmitter
const debug = require('debug')('butter-streamer-file')

var Streamer = require('butter-streamer')

const config = {
  name: 'Simple File Streamer',
  protocol: /file/,
  type: 'file',
  priority: 10
}

class FsFile extends EventEmitter {
  constructor(source, {type, ...info}) {
    super()

    Object.assign(this, info)
    this.source = source
    this.path = type
  }

  createReadStream(range) {
    return fs.createReadStream(this.source, range)
  }
}

class FileStreamer extends Streamer {
  constructor (source, options) {
    if (URI(source).protocol() === 'file') {
      source = URI(source).path()
    }
    super(source, options, config)
  }

  initialize (source, options) {
    return new Promise((resolve, reject) => {
      fs.stat(source, (err, stats) => {
        if (err) reject(err)

        this.stats = stats
        debug('stats', stats)

        resolve([
          new FsFile(source, {
            name: source.split('/').pop(),
            type: mime.getType(source),
            length: stats.size - (opts ? opts.start : 0)
          })
        ])
      })
    })
  }
}

module.exports = FileStreamer
