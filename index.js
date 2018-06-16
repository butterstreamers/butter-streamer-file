const URI = require('urijs')
const fs = require('fs')
const mime = require('mime')
const debug = require('debug')('butter-streamer-file')

const ProgressStreamer = require('butter-streamer/progress/streamer')
const ProgressFile = require('butter-streamer/progress/file')

const config = {
  name: 'Simple File Streamer',
  protocol: /file/,
  type: 'file',
  priority: 10
}

class FsFile extends ProgressFile {
  constructor(source, {type, ...info}) {
    super(info.length)

    Object.assign(this, info)
    this.source = source
    this.path = type
  }

  _createReadStream(range) {
    return fs.createReadStream(this.source, range)
  }
}

class FileStreamer extends ProgressStreamer {
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
