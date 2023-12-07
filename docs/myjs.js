
///define global variables:
window.defaultWidthOfCanvas = 400;
window.defaultHeightOfCanvas = 400;
window.maxXSquares = defaultWidthOfCanvas/10;
window.maxYSquares = defaultHeightOfCanvas/10;
window.arrOfColors = new Array(maxXSquares); //max array size. //Note: first number is the amount of times it's been painted, other three number are RGB.
window.colorRGBMap = {
	red: 'rgb(255,0,0)',
	blue: 'rgb(0,0,255)',
	green: 'rgb(0,255,0)',
	yellow: 'rgb(255,255,0)',
	purple: 'rgb(128,0,128)',
	orange: 'rgb(255,165,0)',
	pink: 'rgb(255,192,203)',
	brown: 'rgb(165,42,42)',
	black: 'rgb(0,0,0)',
};
window.totalPaintDrops = 0;
//used for size of grid:
window.x_value = 0;
window.y_value = 0;

var a = 0; // the total number of paint drops put on the canvas before the stopping criterion stops the painting.
var a1 = 0; // The number of paint drops on the canvas of Color 1.
var a2 = 0; // The number of paint drops on the canvas of Color 2.
var a3 = 0; // The number of paint drops on the canvas of Color 3.
var b = 0; // the maximum number of paint drops on any given square when the painting halts (that is, looking at all the squares,
            //what is the largest number of paint drops that fell on one square?)
var c = 0; // the average number of paint drops over all the squares when the painting halts
var rands = {randNum1: 0, randNum2: 0};
var stopId; // id for setinterval
var computations = {
    a: 0,
    a1: 0,
    a2: 0,
    a3: 0,
    b: 0,
    c: 0
}
var s;
var termItem;
let data = window.performance.getEntriesByType("navigation")[0].type;

//force back to screen to fill in info if they try to reload or anything:
if ("navigate" != data){
    window.location.href = './index.html';
}
window.addEventListener("load", (event) => {
    // initialize canvas size:
    setCanvasSize(defaultWidthOfCanvas, defaultHeightOfCanvas);

    //setup the array:
    for (let i = 0; arrOfColors.length > i; i++) { //ignoring 0 index
        let arrayOfY = new Array(maxYSquares);
        for (let i2 = 0; arrOfColors.length > i2; i2++) {
            arrayOfY[i2] = [0,0,0,0];
        }
        arrOfColors[i] = arrayOfY;
    }
    //At this point array of colors should have all the values initialized to 0.

    //Load all values:
    //https://sentry.io/answers/how-to-get-values-from-urls-in-javascript/
    const searchParams = new URLSearchParams(window.location.search);
    window.searchParams = searchParams;

    for (const param of searchParams) {
        console.log("Data:",param);
    }
    //var dim_x = searchParams.get('dim_x');
    //document.getElementById("l_x").value = dim_x;
    //var dim_y = searchParams.get('dim_y');
    //document.getElementById("l_y").value = dim_y;
	
	window.colorOptions = [searchParams.get('color1'), searchParams.get('color2'), searchParams.get('color3')];

    //<div data-video="" data-autoplay="1" data-loop="1" id="backGroundAudio" hidden="hidden"></div>
    const audioItem = document.getElementById("youtube-audio");
    //audioItem.setAttribute("data-autoplay","1");
    //audioItem.setAttribute("data-loop","1");
    //audioItem.setAttribute("hidden","hidden");

    audioItem.setAttribute('data-video', searchParams.get('song'));
    termItem = searchParams.get('termItem');
    //console.log(searchParams.get('song'));

    //Play SONG:
    var e = document.getElementById("youtube-audio")
        , t = document.createElement("img");
    t.setAttribute("id", "youtube-icon"),
        t.style.cssText = "cursor:pointer;cursor:hand",
        e.appendChild(t);
    var a = document.createElement("div");
    a.setAttribute("id", "youtube-player"),
        e.appendChild(a);
    var o = function(e) {
        var a = e ? "IDzX9gL.png" : "quyUPXN.png";
        t.setAttribute("src", "https://i.imgur.com/" + a)
    };
    e.onclick = function() {
        r.getPlayerState() === YT.PlayerState.PLAYING || r.getPlayerState() === YT.PlayerState.BUFFERING ? (r.pauseVideo(),
            o(!1)) : (r.playVideo(),
            o(!0))
    };
    var r = new YT.Player("youtube-player",{
        height: "0",
        width: "0",
        videoId: e.dataset.video,
        playerVars: {
            autoplay: "1", //e.dataset.autoplay
            loop: "1"//e.dataset.loop
        },
        events: {
            onReady: function(e) {
                r.setPlaybackQuality("small"),
                    o(r.getPlayerState() !== YT.PlayerState.CUED)
            },
            onStateChange: function(e) {
                e.data === YT.PlayerState.ENDED && o(!1)
            }
        }
    })
    audioItem.volume = .10;

    window.current_pos = 0;
    startPainting(searchParams);
});

window.addEventListener("DOMContentLoaded", (event) => {
    const display_value = document.getElementById("showspeed");
    const speed = document.getElementById("speed");
    window.delay = 1000/speed.value;
    speed.addEventListener("input", (event) => {
        display_value.textContent = speed.value;
        display_value.textContent = event.target.value;
    });

    speed.addEventListener("change", (event) => {
        console.log(window.performance.now());
        console.log(1000/speed.value, "ms");
        window.delay = 1000/speed.value;
    });
});

function setCanvasSize(width, height) {
    let canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;
}

function drawInitialShape(x,y) {
    const canvas = document.getElementById("canvas")
    const ctx = document.getElementById("canvas").getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
    //Make block size based on largest length choice:
    window.canvasBlockSize = Math.floor((defaultWidthOfCanvas/x <= defaultWidthOfCanvas/y) ? defaultWidthOfCanvas/x : defaultWidthOfCanvas/y);
    if(x>=1 && x<= maxXSquares && y>=1 && y <= maxYSquares){
        for (let i = 0; i < y; i++) {
            for (let j = 0; j < x; j++) {
                ctx.strokeStyle = 'rgb(0,0,0)';
                ctx.beginPath();
                ctx.rect(1+canvasBlockSize*j,1+canvasBlockSize*i,canvasBlockSize-2,canvasBlockSize-2);
                ctx.stroke();
            }
        }
    } else {
        //output error message
    }
}

function draw() {
    x = window.x_value;
    y = window.y_value;
    const canvas = document.getElementById("canvas")
    const ctx = document.getElementById("canvas").getContext("2d");
    //Make block size based on largest length choice:
    window.canvasBlockSize = Math.floor((defaultWidthOfCanvas/x <= defaultWidthOfCanvas/y) ? defaultWidthOfCanvas/x : defaultWidthOfCanvas/y);
    if(x>=1 && x<= maxXSquares && y>=1 && y <= maxYSquares){
        ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
        for (let i = 0; i < y; i++) {
            for (let j = 0; j < x; j++) {
                ctx.strokeStyle = 'rgb(0,0,0)';
                ctx.beginPath();
                ctx.rect(1+canvasBlockSize*j,1+canvasBlockSize*i,canvasBlockSize-2,canvasBlockSize-2);
                ctx.stroke();
            }
        }
    } else {
        //output error message
    }
}


function fillXY(x,y,colorChoice){
    const ctx = document.getElementById("canvas").getContext("2d");
    if (x >= 1 && x <= maxXSquares && y >= 1 && y <= maxYSquares) {
		var colorRGB = colorRGBMap[colorChoice];
		//console.log("Painting an element");
		//console.log("Color choice is: " + colorChoice);
		if (arrOfColors[x-1][y-1][0] > 0) {
			colorRGB = mixColors(colorRGB, arrOfColors[x-1][y-1][1], arrOfColors[x-1][y-1][2], arrOfColors[x-1][y-1][3]);
			console.log("Painted an element for the", arrOfColors[x-1][y-1][0] + 1, "time");
		}
		var colorObj = $.Color(colorRGB);
		arrOfColors[x-1][y-1][0] += 1;
		arrOfColors[x-1][y-1][1] = colorObj.red();
		arrOfColors[x-1][y-1][2] = colorObj.green();
		arrOfColors[x-1][y-1][3] = colorObj.blue();
		ctx.fillStyle = colorRGB;
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.fillRect((2+canvasBlockSize * x)-canvasBlockSize, (2+canvasBlockSize * y)-canvasBlockSize, canvasBlockSize-4, canvasBlockSize-4);

		switch (parseInt(termItem)) {
			case 1: // Terminate when last unpainted square is painted for the first time
				if (checkAllElementsPainted()) {
					clearInterval(stopId);
                    clearTimeout(stopId);
					console.log("Stopped1");
                    window.fullStop = true;
                    window.current_repititions += 1;
                    if(window.current_pos != window.max_pos) startPainting(window.searchParams);
				} else if(window.repititions <= window.current_repititions){
                    clearInterval(stopId);
                    clearTimeout(stopId);
                    console.log("REPETITION STOP");
                    window.fullStop = true;

                    window.current_pos += 1;
                    if(window.current_pos != window.max_pos) startPainting(window.searchParams);
                }
				break;
			case 2: // Terminate when a square is painted for the second time
				if (arrOfColors[x-1][y-1][0] > 1) {
					console.log("Stopped2");
                    window.fullStop = true;
					clearInterval(stopId);
                    clearTimeout(stopId);
                    window.current_repititions += 1;

                    if(window.current_pos != window.max_pos) startPainting(window.searchParams);
				} else if(window.repititions <= window.current_repititions){
                    clearInterval(stopId);
                    clearTimeout(stopId);
                    console.log("REPETITION STOP");
                    window.fullStop = true;

                    window.current_pos += 1;
                    if(window.current_pos != window.max_pos) startPainting(window.searchParams);
                }
				break;
			case 3: // Terminate when a square is painted for the third time
				if (arrOfColors[x-1][y-1][0] > 2) {
					console.log("Stopped3");
                    window.fullStop = true;
					clearInterval(stopId);
                    clearTimeout(stopId);
                    window.current_repititions += 1;

                    if(window.current_pos != window.max_pos) startPainting(window.searchParams);
				} else if(window.repititions <= window.current_repititions){
                    clearInterval(stopId);
                    clearTimeout(stopId);
                    console.log("REPETITION STOP");
                    window.fullStop = true;

                    window.current_pos += 1;
                    if(window.current_pos != window.max_pos) startPainting(window.searchParams);
                }
				break;
			default:
				console.log("Invalid termItem:", termItem);
		}
		
    }
}

function fillRandomCellWithRandomColor(){
    rands.randNum1 = Math.floor(Math.random()*window.x_value+1); // from 1 to x
    rands.randNum2 = Math.floor(Math.random()*window.y_value+1);  // from 1 to y
    var randomColor = Math.floor(Math.random()*3); // from 0 to 2
	var colorChoice = colorOptions[randomColor];
    fillXY(rands.randNum1, rands.randNum2, colorChoice);
}

function mixColors(color1, color2R, color2G, color2B) {
	color2 = 'rgb(' + color2R + ',' + color2G + ',' + color2B + ')';
	var mixingRatio = 0.5;
	var resultColor = mixbox.lerp(color1, color2, mixingRatio);
	return resultColor;
}

function changeSizeStuff() {
    const can = document.getElementById('canvas');
    const update_div = document.getElementById('update_canvas');
    const controls = document.getElementById('controls');
    const radio_choice = document.getElementById('after_run_div');
    can.style.width = '200px';
    can.style.height = '200px';
    update_div.style.textAlign = 'center';
    update_div.classList.remove('col-sm-5');
    update_div.classList.add('col-sm-8');
    controls.style.display = 'none';
    radio_choice.style.display = 'block';
}

function paintOne() {
    //stopId = setInterval(fillRandomCellWithRandomColor, 1000);
    fillRandomCellWithRandomColor();
	console.log("Interval started");
}

function paintMany() {
        for (var i = 0; i < repititions; i++) {
            paintOne();
        }
}

function checkPaint(){
    if(window.timeStamp + window.delay <= window.performance.now()) {
        //console.log(window.timeStamp + window.delay, " VS ", window.performance.now());
        //console.log("TIME STAMP HIT!");
        window.timeStamp = window.performance.now();
        paintOne();
    }
    clearInterval(stopId);
    console.log(!window.fullStop);
    if(!window.fullStop){
        stopId = setInterval(checkPaint, 25);
    }
}

function startPainting(searchParams) {
    let independent_value = searchParams.get('independent');
    if(searchParams.get('independent') == 1){
        let DIMS = searchParams.get('globalListOfItems').split(',');
        window.max_pos = DIMS.length;
        const dim_XY = DIMS[window.current_pos];
        console.log("Running", dim_XY);
        window.x_value = dim_XY;
        window.y_value = dim_XY;
        window.fullStop = false;
        draw();
        window.repititions = searchParams.get('repetitions');
        window.current_repititions = 0;
        window.timeStamp = window.performance.now();
        checkPaint();
        //stopId = setInterval(checkPaint, 25);
    } else if(searchParams.get('independent') == 2){
        let DIMXS = searchParams.get('globalListOfItems').split(',');
        window.max_pos = DIMXS.length;
        const dim_X = DIMXS[window.current_pos];
        console.log("Running", dim_X);
        window.fullStop = false;
        let dim_y = searchParams.get('dim_y');
        window.x_value = dim_X;
        window.y_value = dim_y;
        draw();
        window.repititions = searchParams.get('repetitions');
        window.current_repititions = 0;
        window.timeStamp = window.performance.now();
        checkPaint();
        //stopId = setInterval(checkPaint, 25);
    } else if(searchParams.get('independent') == 3){
        let REPS = searchParams.get('globalListOfItems').split(',');
        window.max_pos = REPS.length;
        const rep_value = REPS[window.current_pos];
        console.log("Running", rep_value);
        window.repititions = rep_value;
        console.log([searchParams.get('globalListOfItems').split(',')]);
        console.log(Number(rep_value));
        window.fullStop = false;
        let dim_XY = searchParams.get('dim_Y_X');
        window.x_value = dim_XY;
        window.y_value = dim_XY;
        draw();
        window.current_repititions = 0;
        window.timeStamp = window.performance.now();
        checkPaint();
        //stopId = setInterval(checkPaint, 25);
    } else {
        console.log("INVALID INDEPENDENT VALUE: ", independent_value);
    }
}

function checkAllElementsPainted() {
	var xMax = window.x_value;
    var yMax = window.y_value;
	for (let iterX = 0; iterX < xMax; iterX++) {
		for (let iterY = 0; iterY < yMax; iterY++) {
			if (arrOfColors[iterX][iterY][0] == 0) {
				//console.log("arrOfColors[x=" + iterX + "][y=" + iterY + "][0] == 0, is not painted");
				return false;
			}
		}
	}
	return true;
}

function getTotalPaintDrops(){
    window.totalPaintDrops = 0;
    var xMax = document.getElementById("l_x").value;
    var yMax = document.getElementById("l_y").value;
    for (let iterX = 0; iterX < xMax; iterX++) {
        for (let iterY = 0; iterY < yMax; iterY++) {
            window.totalPaintDrops += arrOfColors[iterX][iterY][0];
        }
    }
    return window.totalPaintDrops;
}

function pause(){
    clearInterval(stopId);

}

function unpause(){
    window.timeStamp = window.performance.now();
    checkPaint();
}


