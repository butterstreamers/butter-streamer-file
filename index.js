const URI = require('urijs')
const fs = require('fs')
const debug = require('debug')('butter-streamer-file')

var Streamer = require('butter-streamer')

const config = {
	name: 'Simple File Streamer',
	protocol: /file/,
	type: 'file',
	priority: 10
}

class FileStreamer extends Streamer {
	constructor (source, options = {}) {
		super(options, config)
		if (URI(source).protocol() === 'file') {
			source = URI(source).path()
		}

		debug('source', source)
		this._source = source
		fs.stat(source, (err, stats) => {
			if (err) throw err

			this.stats = stats

			debug('stats', stats)
			this._fileStream = fs.createReadStream(source)

			this.ready(this._fileStream, stats.size)
		})
	}

	seek (start = 0, end) {
		if (this._destroyed) throw new ReferenceError('Streamer already destroyed')

		this._fileStream = fs.createReadStream(this._source, {start: start, end: end})

		this.reset(this._fileStream, this.stats.size - start)
  }

  destroy () {
    super.destroy()
    this._fileStream = null
  }
}

module.exports = FileStreamer
