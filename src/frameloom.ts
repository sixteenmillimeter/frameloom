#!/usr/bin/env node

'use strict'

const execRaw 	= require('child_process').exec
const os 		= require('os')
const path 		= require('path')
const program 	= require('commander')
const fs 		= require('fs-extra')

const pkg : any = require('./package.json')

const OUTPUT_RE : RegExp = new RegExp('{{o}}', 'g')
const INPUT_RE  : RegExp = new RegExp('{{i}}', 'g')

let QUIET : boolean = false
let TMPDIR  : string = os.tmpdir() || '/tmp'
let TMPPATH : string

/**
 * 	Shells out to execute a command with async/await.
 * 	Async wrapper to exec module.
 *
 *	@param	{string} 	cmd 	Command to execute
 *
 *	@returns {Promise} 	Promise containing the complete stdio
 **/
async function exec (cmd : string) {
	return new Promise((resolve : any, reject : any) => {
		return execRaw(cmd, { maxBuffer : 500 * 1024 * 1024}, (err : any, stdio : string, stderr : string) => {
			if (err) return reject(err)
			return resolve(stdio)
		})
	})
}
/**
 * 	Delays process for specified amount of time in milliseconds.
 *
 *	@param	{integer} 	ms 	Milliseconds to delay for
 *
 *	@returns {Promise} 	Promise that resolves after set time
 **/
async function delay (ms : number) {
	return new Promise((resolve : any, reject : any) =>{
		return setTimeout(resolve, ms)
	})
}
/**
 * Log function wrapper that can silences logs when
 * QUIET == true
 */
function log (msg : string, err : any = false) {
	if (QUIET) return false
	if (err) {
		console.error(msg, err)
	} else {
		console.log(msg)
	}
	return true
}
/**
 * 	Pads a numerical value with preceding zeros to make strings same length.
 *
 *	@param 	{integer} 	i 		Number to pad
 * 	@param 	{integer} 	max 	(optional) Maximum length of string to pad to
 *
 * 	@returns {string} 	Padded number as a string
 **/
function zeroPad (i : number, max : number = 5) {
	let str : string = i + ''
	let len : number = str.length
	for (let x : number = 0; x < max - len; x++) {
		str = '0' + str
	}
	return str
}
/**
 * 	Shuffles an array into a random state.
 *
 * 	@param 	{array} 	a 	Array to randomize
 **/
function shuffle (array : any[]) {
	let j : any 
	let temp : any
    for (let i : number = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

function randomInt (min : number, max : number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 	Clears the temporary directory of all files. 
 * 	Establishes a directory if none exists.
 **/
async function clear () {
	let cmd : string = `rm -r "${TMPPATH}"`
	let exists : boolean

	try {
		exists = await fs.exists(TMPPATH)
	} catch (err) {
		log('Error checking if file exists', err)
	}

	if (exists) {
		log(`Clearing temp directory "${TMPPATH}"`)
		try {
			await exec(cmd)
		} catch (err) {
			//suppress error
			console.dir(err)
		}
	}

	try {
		await fs.mkdir(TMPPATH)
	} catch (err) {
		if (err.code !== 'EEXIST') {
			log('Error making directory', err)
		}
	}

	return true
}
/**
 * 	Exports all frames from video. Appends number to the string
 * 	to keep frames in alternating order to be quickly stitched together
 *  or re-sorted.
 *
 * 	@param 	{string} 	video 	String representing path to video
 * 	@param 	{integer} 	order 	Integer to be appended to pathname of file
 *  @param  {boolean}   avconv	Whether or not to use avconv instead of ffmpeg
 *
 * 	@returns 	{string} 	String with the export order, not sure why I did this
 **/
async function frames (video : string, order : number, avconv : boolean) {
	let ext : string = 'tif'
	let exe : string = avconv ? 'avconv' : 'ffmpeg'
	let tmpoutput : string
	let cmd : string

	tmpoutput = path.join(TMPPATH, `export-%05d_${order}.${ext}`)

	cmd = `${exe} -i "${video}" -compression_algo raw -pix_fmt rgb24 "${tmpoutput}"`

	log(`Exporting ${video} as single frames...`)

	try {
		await exec(cmd)
	} catch (err) {
		log('Error exporting video', err)
		return process.exit(3)
	}

	return path.join(TMPPATH, `export-%05d_${order}`)
}
/**
 * Shells out to run a sub command on every frame to perform effects
 *
 *  @param  {string}	cmd 	Command to execute on every frame
 *
 **/
async function subExec (cmd : string) {
	let frames : string[]
	let frameCmd : string
	let framePath : string

	try {
		frames = await fs.readdir(TMPPATH)
	} catch (err) {
		log('Error reading tmp directory', err)
	}

	frames = frames.filter (file =>{
		if (file.indexOf('.tif') !== -1) return true
	})

	for (let frame of frames) {
		framePath = path.join(TMPPATH, frame)
		if (cmd.indexOf('{{i}}') !== -1 || cmd.indexOf('{{o}}')) {
			frameCmd = cmd.replace(INPUT_RE, framePath)
						.replace(OUTPUT_RE, framePath)
		} else {
			frameCmd = `${cmd} ${framePath}`
		}

		try {
			await exec(frameCmd)
		} catch (err) {
			log('Error executing sub command on frame', err)
			return process.exit(10)
		}
	}
} 
/**
 *	Re-arranges the frames into the order specified in the pattern.
 *	Calls `patternSort()` to perform the rename and unlink actions
 * 
 * 	@param 	{array} 	pattern 	Pattern of the frames per input
 * 	@param 	{boolean}	realtime 	Flag to turn on or off realtime behavior (drop frames / number of vids)
 *  @param  {boolean}   random 		Whether or not to randomize frames
 **/
async function weave (pattern : number[], realtime : boolean, random : boolean) {
	let frames : string[]
	let seq : string[]
	let alt : boolean = false

	log('Weaving frames...')

	try {
		frames = await fs.readdir(TMPPATH)
	} catch (err) {
		log('Error reading tmp directory', err)
	}

	//console.dir(frames)
	frames = frames.filter (file =>{
		if (file.indexOf('.tif') !== -1) return true
	})
	
	for (let el of pattern) {
		if (el !== 1) alt = true
	}

	if (random){
		log('Sorting frames randomly...')
		try {
			seq = await randomSort(frames, pattern, realtime)
		} catch (err) {
			log('Error sorting frames', err)
		}
	} else if (!alt) {
		log('Sorting frames normally...')
		try {
			seq = await standardSort(frames, pattern, realtime)
		} catch (err) {
			log('Error sorting frames', err)
		}
	} else if (alt) {
		//log('This feature is not ready, please check https://github.com/sixteenmillimeter/frameloom.git', {})
		//process.exit(10)
		log('Sorting frames with alternate pattern...')
		try {
			seq = await altSort(frames, pattern, realtime)
		} catch (err) {
			log('Error sorting frames', err)
		}
	}
	//console.dir(seq)
}
/**
 * 	Alternate frame sorting method.
 *
 *	@param	{array}		list 		List of frames to group
 * 	@param 	{array} 	pattern 	Array representing pattern
 *	@param 	{boolean}	realtime 	Flag to group with "realtime" behavior
 **/
async function altSort (list : string[], pattern : number[], realtime : boolean) {
	let groups : any[] = []
	let newList : string[] = []
	let loops : number = 0
	let patternIndexes : number[] = []
	let frameCount : number = 0
	let skipCount : number
	let skip : boolean
	let oldName : string
	let oldPath : string
	let newName : string
	let newPath : string
	let ext : string = path.extname(list[0])
	let x : number
	let i : number
	
	for (x = 0; x < pattern.length; x++) {
		groups.push([])
		for (let i : number = 0; i < pattern[x]; i++) {
			patternIndexes.push(x)
		}
	}

	for (i = 0; i < list.length; i++) {
		groups[i % pattern.length].push(list[i])
	}

	loops = Math.ceil(list.length / patternIndexes.length)

	if (realtime) {
		skip = false
		skipCount = patternIndexes.length + 1
	}

	for (x = 0; x < loops; x++) {
		for (i = 0; i < patternIndexes.length; i++) {

			if (realtime) {
				skipCount--;
				if (skipCount === 0) {
					skip = !skip;
					skipCount = pattern.length
				}
			}

			if (typeof groups[patternIndexes[i]][0] === 'undefined') {
				continue
			}

			oldName = String(groups[patternIndexes[i]][0])
			oldPath = path.join(TMPPATH, oldName)

			groups[patternIndexes[i]].shift()

			if (skip) {
				log(`Skipping ${oldName}`)
				try {
					await fs.unlink(oldPath)
				} catch (err) {
					log('Error deleting frame', err)
				}
				continue
			}

			newName = `./render_${zeroPad(frameCount)}${ext}`
			newPath = path.join(TMPPATH, newName)
			log(`Renaming ${oldName} -> ${newName}`)

			try {
				await fs.move(oldPath, newPath)
				newList.push(newName)
				frameCount++
			} catch (err) {
				log('Error renaming frame', err)
				return process.exit(10)
			}
		}
	}

	return newList
}
/**
 * 	Standard frame sorting method.
 *
 *	@param	{array}		list 		List of frames to group
 * 	@param 	{array} 	pattern 	Array representing pattern
 *	@param 	{boolean}	realtime 	Flag to group with "realtime" behavior
 **/
async function standardSort (list : string[], pattern : number[], realtime : boolean) {
	let frameCount : number = 0
	let stepCount : number
	let step : any
	let skipCount : number
	let skip : boolean
	let ext : string = path.extname(list[0])
	let oldPath : string
	let newName : string
	let newPath : string
	let newList : string[] = []

	if (realtime) {
		skip = false
		skipCount = pattern.length + 1
	}
	
	for (let i : number = 0; i < list.length; i++) {
		if (realtime) {
			skipCount--;
			if (skipCount === 0) {
				skip = !skip;
				skipCount = pattern.length
			}
		}

		oldPath = path.join(TMPPATH, list[i])

		if (skip) {
			log(`Skipping ${list[i]}`)
			try {
				await fs.unlink(oldPath)
			} catch (err) {
				log('Error deleting frame', err)
			}
			continue
		}

		newName = `./render_${zeroPad(frameCount)}${ext}`
		newPath = path.join(TMPPATH, newName)
		log(`Renaming ${list[i]} -> ${newName}`)

		try {
			await fs.move(oldPath, newPath)
			newList.push(newName)
			frameCount++
		} catch (err) {
			log('Error renaming frame', err)
			return process.exit(10)
		}

		
	}

	return newList
}
/**
 *	Ramdomly sort frames for re-stitching.
 *	
 *	@param	{array}		list 		List of frames to group
 * 	@param 	{array} 	pattern 	Array representing pattern
 *	@param 	{boolean}	realtime 	Flag to group with "realtime" behavior
 **/
async function randomSort (list : string[], pattern : number[], realtime : boolean) {
	let frameCount : number = 0
	let ext : string = path.extname(list[0])
	let oldPath : string
	let newName : string
	let newPath : string
	let newList  : string[] = []
	let removeLen : number = 0
	let remove : string[] = []

	shuffle(list)

	if (realtime) {
		removeLen = Math.floor(list.length / pattern.length)
		remove = list.slice(removeLen, list.length)
		list = list.slice(0, removeLen)

		log(`Skipping extra frames...`)
		for (let i : number = 0; i < remove.length; i++) {
			oldPath = path.join(TMPPATH, remove[i])
			log(`Skipping ${list[i]}`)
			try {
				await fs.unlink(oldPath)
			} catch (err) {
				log('Error deleting frame', err)
			}
		}
	}
	
	for (let i : number = 0; i < list.length; i++) {
		oldPath = path.join(TMPPATH, list[i])

		newName = `./render_${zeroPad(frameCount)}${ext}`
		newPath = path.join(TMPPATH, newName)
		log(`Renaming ${list[i]} -> ${newName}`)

		try {
			await fs.move(oldPath, newPath)
			newList.push(newName)
		} catch (err) {
			log('Error moving frame', err)
		}

		frameCount++
	}

	return newList
}

async function spinFrames () {
	let frames : string[]
	let framePath : string
	let cmd : string
	let flip : string
	let flop : string
	let rotate : string 

	console.log('Spinning frames...')

	try {
		frames = await fs.readdir(TMPPATH)
	} catch (err) {
		console.error('Error reading tmp directory', err)
	}

	//console.dir(frames)
	frames = frames.filter (file =>{
		if (file.indexOf('.tif') !== -1) return true
	})

	for (let frame of frames) {
		framePath = path.join(TMPPATH, frame)
		rotate = ''
		flip = ''
		flop = ''
		if (randomInt(0, 1) === 1) {
			rotate = '-rotate 180 '
		}
		if (randomInt(0, 1) === 1) {
			flip = '-flip '
		}
		if (randomInt(0, 1) === 1) {
			flop = '-flop '
		}
		if (flip === '' && flop === '' && rotate === '') {
			//skip unrotated, unflipped and unflopped frames
			continue
		}
		cmd = `convert ${framePath} ${rotate}${flip}${flop} ${framePath}`
		console.log(cmd)
		try {
			await exec(cmd)
		} catch (err) {
			console.error(err)
			process.exit(10)
		}
	}
}

/**
 *	Render the frames into a video using ffmpeg.
 *
 * 	@param 	{string} 	output 	Path to export the video to
 *  @param  {boolean}   avconv  Whether or not to use avconv in place of ffmpeg
 **/
async function render (output : string, avconv : boolean) {
	//process.exit()
	let frames : string = path.join(TMPPATH, `render_%05d.tif`)
	let exe : string = avconv ? 'avconv' : 'ffmpeg'
	let resolution : string = '1920x1080' //TODO: make variable/argument
	//TODO: make object configurable with shorthand names
	let h264  : string = `-vcodec libx264 -g 1 -crf 25 -pix_fmt yuv420p`
	let prores : string = `-c:v prores_ks -profile:v 3`
	//
	let format : string = (output.indexOf('.mov') !== -1) ? prores : h264
	let framerate  : string = `24`
	const cmd  : string = `${exe} -r ${framerate} -f image2 -s ${resolution} -i ${frames} ${format} -y ${output}`
	
	log(`Exporting video ${output}`)
	log(cmd)

	try {
		await exec(cmd)
	} catch (err) {
		log('Error rendering video with ffmpeg', err)
	}
}
/**
 * 	Parses the arguments and runs the process of exporting, sorting and then
 * 	"weaving" the frames back into a video 
 * 
 * @param {object} 	arg 	Object containing all arguments
 **/
async function main (arg : any) {
	let input : string[] = arg.input.split(':')
	let output : string = arg.output
	let pattern : any[] = []
	let realtime : boolean = false
	let avconv : boolean = false
	let random : boolean = false
	let e  : any = false
	let exe : string = arg.avconv ? 'avconv' : 'ffmpeg'
	let exists : any 

	console.time('frameloom')

	if (input.length < 2) {
		log('Must provide more than 1 input', {})
		return process.exit(1)
	}

	if (!output) {
		log('Must provide video output path', {})
		return process.exit(2)
	}

	if (arg.random) {
		random = true
	}

	if (arg.avconv) {
		avconv = true
	}

	if (arg.tmp) {
		TMPDIR = arg.tmp
	}

	if (arg.exec) {
		e = arg.exec
	}

	if (arg.quiet) {
		QUIET = true
	}

	if (arg.pattern) {
		pattern = arg.pattern.split(':')
		pattern = pattern.map(el =>{
			return parseInt(el);
		})
	} else {
		for (let i = 0; i <input.length; i++) {
			pattern.push(1);
		}
	}

	try {
		exists = await exec(`which ${exe}`)
	} catch (err) {
		log(`Error checking for ${exe}`)
		process.exit(11)
	}

	if (!exists || exists === '' || exists.indexOf(exe) === -1) {
		log(`${exe} is required and is not installed. Please install ${exe} to use frameloom.`)
		process.exit(12)
	}

	if (pattern.length !== input.length) {
		log(`Number of inputs (${input.length}) doesn't match the pattern length (${pattern.length})`)
		process.exit(10)
	}

	if (arg.realtime) realtime = true;

	TMPPATH = path.join(TMPDIR, 'frameloom');

	try {
		await clear()
	} catch (err) {
		log('Error clearing temp directory', err)
		return process.exit(3)
	}

	log(`Processing video files ${input.join(', ')} into ${output} with pattern ${pattern.join(':')}`)

	for (let i = 0; i < input.length; i++) {
		try {
			await frames(input[i], i, avconv)
		} catch (err) {
			log('Error exporting video fie to image sequence', err)
			return process.exit(4)
		}
	}

	try {
		await weave(pattern, realtime, random)
	} catch (err) {
		log('Error weaving', err)
		return process.exit(5)
	}

	if (arg.spin) {
		try {
			await spinFrames()
		} catch (err) {
			log('Error spinning', err)
			return process.exit(13)
		}
	}

	if (e) {
		try {
			await subExec(e)
		} catch (err) {
			log('Error performing subcommand', err)
			return process.exit(7)
		}
	}

	try {
		await render(output, avconv)
	} catch (err) {
		log('Error rendering', err)
		return process.exit(6)
	}

	try {
		await clear()
	} catch (err) {
		log('Error clearing files', err)
		return process.exit(7)
	}

	console.timeEnd('frameloom')
}

program
  .version(pkg.version)
  .option('-i, --input [files]', 'Specify input videos with paths seperated by colon')
  .option('-o, --output [file]', 'Specify output path of video')
  .option('-p, --pattern [pattern]', 'Specify a pattern for the flicker 1:1 is standard')
  .option('-r, --realtime', 'Specify if videos should preserve realtime speed')
  .option('-t, --tmp [dir]', 'Specify tmp directory for exporting frames')
  .option('-a, --avconv', 'Specify avconv if preferred to ffmpeg')
  .option('-R, --random', 'Randomize frames. Ignores pattern if included')
  .option('-s, --spin', 'Randomly rotate frames before rendering')
  .option('-e, --exec', 'Command to execute on every frame. Specify {{i}} and {{o}} if the command requires it, otherwise frame path will be appended to command')
  .option('-q, --quiet', 'Suppresses all log messages')
  .parse(process.argv)

main(program)