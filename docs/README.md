## Functions

<dl>
<dt><a href="#exec">exec(cmd)</a> ⇒ <code>Promise</code></dt>
<dd><p>Shells out to execute a command with async/await.
    Async wrapper to exec module.</p>
</dd>
<dt><a href="#delay">delay(ms)</a> ⇒ <code>Promise</code></dt>
<dd><p>Delays process for specified amount of time in milliseconds.</p>
</dd>
<dt><a href="#log">log()</a></dt>
<dd><p>Log function wrapper that can silences logs when
QUIET == true</p>
</dd>
<dt><a href="#zeroPad">zeroPad(i, max)</a> ⇒ <code>string</code></dt>
<dd><p>Pads a numerical value with preceding zeros to make strings same length.</p>
</dd>
<dt><a href="#shuffle">shuffle(a)</a></dt>
<dd><p>Shuffles an array into a random state.</p>
</dd>
<dt><a href="#clear">clear()</a></dt>
<dd><p>Clears the temporary directory of all files.
    Establishes a directory if none exists.</p>
</dd>
<dt><a href="#frames">frames(video, order, avconv)</a> ⇒ <code>string</code></dt>
<dd><p>Exports all frames from video. Appends number to the string
    to keep frames in alternating order to be quickly stitched together
 or re-sorted.</p>
</dd>
<dt><a href="#subExec">subExec(cmd)</a></dt>
<dd><p>Shells out to run a sub command on every frame to perform effects</p>
</dd>
<dt><a href="#weave">weave(pattern, realtime, random)</a></dt>
<dd><p>Re-arranges the frames into the order specified in the pattern.
    Calls <code>patternSort()</code> to perform the rename and unlink actions</p>
</dd>
<dt><a href="#altSort">altSort(list, pattern, realtime)</a></dt>
<dd><p>Alternate frame sorting method.</p>
</dd>
<dt><a href="#standardSort">standardSort(list, pattern, realtime)</a></dt>
<dd><p>Standard frame sorting method.</p>
</dd>
<dt><a href="#randomSort">randomSort(list, pattern, realtime)</a></dt>
<dd><p>Ramdomly sort frames for re-stitching.</p>
</dd>
<dt><a href="#render">render(output, avconv)</a></dt>
<dd><p>Render the frames into a video using ffmpeg.</p>
</dd>
<dt><a href="#main">main(arg)</a></dt>
<dd><p>Parses the arguments and runs the process of exporting, sorting and then
    &quot;weaving&quot; the frames back into a video</p>
</dd>
</dl>

<a name="exec"></a>

## exec(cmd) ⇒ <code>Promise</code>
Shells out to execute a command with async/await.
	Async wrapper to exec module.

**Kind**: global function  
**Returns**: <code>Promise</code> - Promise containing the complete stdio  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Command to execute |

<a name="delay"></a>

## delay(ms) ⇒ <code>Promise</code>
Delays process for specified amount of time in milliseconds.

**Kind**: global function  
**Returns**: <code>Promise</code> - Promise that resolves after set time  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>integer</code> | Milliseconds to delay for |

<a name="log"></a>

## log()
Log function wrapper that can silences logs when
QUIET == true

**Kind**: global function  
<a name="zeroPad"></a>

## zeroPad(i, max) ⇒ <code>string</code>
Pads a numerical value with preceding zeros to make strings same length.

**Kind**: global function  
**Returns**: <code>string</code> - Padded number as a string  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| i | <code>integer</code> |  | Number to pad |
| max | <code>integer</code> | <code>5</code> | (optional) Maximum length of string to pad to |

<a name="shuffle"></a>

## shuffle(a)
Shuffles an array into a random state.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>array</code> | Array to randomize |

<a name="clear"></a>

## clear()
Clears the temporary directory of all files.
	Establishes a directory if none exists.

**Kind**: global function  
<a name="frames"></a>

## frames(video, order, avconv) ⇒ <code>string</code>
Exports all frames from video. Appends number to the string
	to keep frames in alternating order to be quickly stitched together
 or re-sorted.

**Kind**: global function  
**Returns**: <code>string</code> - String with the export order, not sure why I did this  

| Param | Type | Description |
| --- | --- | --- |
| video | <code>string</code> | String representing path to video |
| order | <code>integer</code> | Integer to be appended to pathname of file |
| avconv | <code>boolean</code> | Whether or not to use avconv instead of ffmpeg |

<a name="subExec"></a>

## subExec(cmd)
Shells out to run a sub command on every frame to perform effects

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Command to execute on every frame |

<a name="weave"></a>

## weave(pattern, realtime, random)
Re-arranges the frames into the order specified in the pattern.
	Calls `patternSort()` to perform the rename and unlink actions

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| pattern | <code>array</code> | Pattern of the frames per input |
| realtime | <code>boolean</code> | Flag to turn on or off realtime behavior (drop frames / number of vids) |
| random | <code>boolean</code> | Whether or not to randomize frames |

<a name="altSort"></a>

## altSort(list, pattern, realtime)
Alternate frame sorting method.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>array</code> | List of frames to group |
| pattern | <code>array</code> | Array representing pattern |
| realtime | <code>boolean</code> | Flag to group with "realtime" behavior |

<a name="standardSort"></a>

## standardSort(list, pattern, realtime)
Standard frame sorting method.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>array</code> | List of frames to group |
| pattern | <code>array</code> | Array representing pattern |
| realtime | <code>boolean</code> | Flag to group with "realtime" behavior |

<a name="randomSort"></a>

## randomSort(list, pattern, realtime)
Ramdomly sort frames for re-stitching.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>array</code> | List of frames to group |
| pattern | <code>array</code> | Array representing pattern |
| realtime | <code>boolean</code> | Flag to group with "realtime" behavior |

<a name="render"></a>

## render(output, avconv)
Render the frames into a video using ffmpeg.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| output | <code>string</code> | Path to export the video to |
| avconv | <code>boolean</code> | Whether or not to use avconv in place of ffmpeg |

<a name="main"></a>

## main(arg)
Parses the arguments and runs the process of exporting, sorting and then
	"weaving" the frames back into a video

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| arg | <code>object</code> | Object containing all arguments |

