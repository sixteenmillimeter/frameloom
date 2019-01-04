'use strict'

const { exec } = require('pkg')
const os = require('os')
const fs = require('fs-extra')

const platform = os.platform()
const arch = os.arch()

//exec(args) takes an array of command line arguments and returns a promise. For example:

if (!fs.existsSync(`./dist/${platform}_${arch}`)) {
	fs.mkdirSync(`./dist/${platform}_${arch}`)
}

exec([ 'frameloom', '--target', 'host', '--output', `./dist/${platform}_${arch}/frameloom` ]).then(res => {
	console.log('built')
}).catch(err => {
	console.error(err)
})
// do something with app.exe, run, test, upload, deploy, etc