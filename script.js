


let header = document.getElementById("header");
let selectMenu = document.getElementById("selectMenu");
let crossword = document.getElementById("crossword");
let downClues = document.getElementById("down");
let acrossClues = document.getElementById("across");
let addBlackTilesButton = document.getElementById("addBlackTilesButton");
let trashIcon = document.getElementById("trashIcon");
let checkIcon = document.getElementById("checkIcon");
let clearIcon = document.getElementById("clearIcon");
let fillIcon = document.getElementById("fillIcon");
let clickIcon = document.getElementById("clickIcon");
let crosswordFocus = true;
var selected;
var direction; //true = horizontal; false = vertical
var crosswordData = [];
var dimension = 5; 
var addingBlackTiles = false;
var across = [];
var down = [];







/* SETUP/RENDERING FUNCTIONS */

function setTileStates(){
	for(let y = 0; y < dimension; y++){
		for(let x = 0; x < dimension; x++){
			let tile = crosswordData[y][x];
			if(tile.state == "black"){
				continue;
			}else if(tile == selected){
				tile.state = "selected";
			}else if((direction == true && tile.y == selected.y) || (direction == false && tile.x == selected.x)){
				tile.state = "highlighted";
			}else{
				tile.state = "blank";
			}
		}
	}
	
}

function renderCrossword(){
	clearCrossword();
	blurAllInput();
	findClueNumbers();
	dimension = selectMenu.value;
	setTileStates();
	for(let y = 0; y < dimension; y++){
		let tr = document.createElement("tr");
		for(let x = 0; x < dimension; x++){
			
			let tile = crosswordData[y][x].render();
			tr.appendChild(tile);
		}
		crossword.appendChild(tr);
	}
	renderClues();
}

function renderClues(){
	while(acrossClues.childNodes[1]){
		acrossClues.removeChild(acrossClues.lastChild);
	}
	while(downClues.childNodes[1]){
		downClues.removeChild(downClues.lastChild);
	}
	for(let y = 0; y < dimension; y++){
		for(let x = 0; x < dimension; x++){
			let tile = crosswordData[y][x];
			if(tile.clueA != null){
				acrossClues.appendChild(tile.clueA.render("a"));
			}
			if(tile.clueD != null){
				downClues.appendChild(tile.clueD.render("d"));
			}
		}
	}
}

function findClueNumbers(){
	var index = 1;
	for(let y = 0; y < dimension; y++){
		for(let x = 0; x < dimension; x++){
			let tile = crosswordData[y][x];
			if((tile.value != "") && (tile.value != "~")){
				var isDown = false;
				var isAcross = false;
				
				if((x == 0 || crosswordData[y][x - 1].value == "" || crosswordData[y][x - 1].value == "~") &&
				(crosswordData[y][x + 1].value != "" && crosswordData[y][x + 1].value != "~") && 
				(crosswordData[y][x + 1].value)){
					isAcross = true;
				}
				if((y == 0 || crosswordData[y - 1][x].value == "" || crosswordData[y - 1][x].value == "~")
					&& ((crosswordData[y + 1][x].value != "") && (crosswordData[y + 1][x].value != "~")) 
					&& (crosswordData[y + 1][x].value)){
					isDown = true;
				}
				if(isAcross){
					if(tile.clueA != null){
						tile.clueA.number = index;
					}else{
						tile.clueA = new Clue(index, "", true, x, y);
					}
				}else{
					tile.clueA = null;
				}
				if(isDown){
					if(tile.clueD != null){
						tile.clueD.number = index;
					}else{
						tile.clueD = new Clue(index, "", false, x, y);
					}
				}else{
					tile.clueD = null;
				}
				if(isDown || isAcross){
					index++;
				}
			}
		}
	}
}	
function blurAllInput(){
	selectMenu.blur();
}
function createSelectMenu(){
	for(let i = 4; i < 21; i++){
		var option = document.createElement("option");
		var text = document.createTextNode((i + 1).toString());
		option.setAttribute("value", i + 1);
		option.appendChild(text);
		selectMenu.appendChild(option);
	}
}
function selectDefaultTile(){
	direction = true;
	for(let y = 0; y < dimension; y++){
		for(let x = 0; x < dimension; x++){
			let tile = crosswordData[y][x];
			if(tile.state != "black"){
				selected = tile;
				return;
			}
		}
	}
}
function clearCrossword(){
	while(crossword.firstChild){
		crossword.removeChild(crossword.firstChild);
	}
}
function resetTiles(){
	crosswordData = [];
	for(let y = 0; y < 22; y++){
		var row = [];
		for(let x = 0; x < 22; x++){
			row.push(new Tile(x, y));
		}
		crosswordData.push(row);
	}	
}
function resetCrossword(){
	addingBlackTiles = true;
	addBlackTiles();
	resetTiles();
	direction = true;
	selected = crosswordData[0][0];
	renderCrossword();
}
//returns in x, y format
function convertCoords(c){
	var temp = c.split(",");
	temp[0] = +temp[0];
	temp[1] = +temp[1];
	return temp;
}






/* UTILITY FUNCTIONS */

function save(){
	file = fopen("history.json", 3);
	fwrite(file, "hello");
}

function deleteClueAcross(element){
	let coords = element.parentNode.childNodes[1].id.split(',');
	crosswordData[coords[1]][coords[0]].clueA.text = "";
	renderClues();
}

function deleteClueDown(element){
	let coords = element.parentNode.childNodes[1].id.split(',');
	crosswordData[coords[1]][coords[0]].clueD.text = "";
	renderClues();
}

function addBlackTiles(){
	addingBlackTiles = !addingBlackTiles;
	(addingBlackTiles ? clickIcon.setAttribute("src", "./images/clickActive.png") : clickIcon.setAttribute("src", "./images/click.png"));
}

function fill(){
	for(let y = 0; y < dimension; y++){
		for(let x = 0; x < dimension; x++){
			let tile = crosswordData[y][x];
			if(tile.value == ""){
				tile.black();
			}
		}
	}
	renderCrossword();
}
function clearBlackTiles(){
	for(let y = 0; y < dimension; y++){
		for(let x = 0; x < dimension; x++){
			let tile = crosswordData[y][x];
			if(tile.state == "black"){
				tile.state = "blank";
			}
		}
	}
	renderCrossword();
}





/* CREATE ELEMENTS */

class Tile{
	constructor(x, y){
		this.value = '';
		this.clueA = null;
		this.clueD = null;
		this.state = null;
		this.x = x;
		this.y = y;
	}
	render(){
		return createTile(this);
	}
	black(){
		if(this.state == "selected"){
			this.state = "black";
			selectDefaultTile();
		}
		this.state = "black";
		this.value = "";
		this.clueA = null;
		this.clueD = null;
		
	}
	reset(){
		this.value = "";
		this.clueA = null;
		this.clueD = null;
		this.state = "blank";
	}
	toString(){
		var s = "Value: " + this.value + 
		"\nX: " + this.x + 
		"\nY: " + this.y + 
		"\nState: " + this.state;
		return s;
	}
}

class Clue{
	constructor(number, text, direction, x, y){
		this.number = number;
		this.text = text;
		this.direction = direction; //true = across, false = down
		this.x = x;
		this.y = y;
	}

	setText(text){
		this.text = text;
	}

	render(){
		return createClue(this);
	}
}
function handleClueChange(input){
	coords = input.id.split(',');
	if(coords[2] == "true"){
			crosswordData[coords[1]][coords[0]].clueA.text = input.value;
	}else{
			crosswordData[coords[1]][coords[0]].clueD.text = input.value;
	}
	renderCrossword();
}
function handleDimensionChange(){
	selectDefaultTile();
	renderCrossword();
}
function handleClueFocus(){
	crosswordFocus = false;
}
function createClue(c, direction){
	let container = document.createElement("div");
	let clueNumber = document.createElement("span");
	let deleteClue = document.createElement("img");
	deleteClue.setAttribute("src", "./images/trash.png");
	deleteClue.style.height = "20px";
	deleteClue.style.width = "20px";
	deleteClue.style.marginLeft = "6px";
	deleteClue.style.position = "relative";
	deleteClue.style.top = "3px";
	deleteClue.style.visibility = "hidden";
	direction == "a" ? deleteClue.setAttribute("onclick", "deleteClueAcross(this)") : deleteClue.setAttribute("onclick", "deleteClueDown(this)");
	clueNumber.innerHTML = c.number + ". ";
	let clue = document.createElement("input");
	clue.setAttribute("spellcheck", "false");
	clue.setAttribute("id", (c.x + "," + c.y + "," + c.direction));
	clue.setAttribute("onchange", "handleClueChange(this)");
	clue.setAttribute("onfocus", "handleClueFocus(this)");
	clue.setAttribute("type", "text");
	clue.setAttribute("value", c.text);
	clue.style.width = "80%";
	container.appendChild(clueNumber);
	container.appendChild(clue);
	container.appendChild(deleteClue);
	container.setAttribute("onmouseover", "containerOnMouseOver(this)");
	container.setAttribute("onmouseout", "containerOnMouseOut(this)");
	container.style.paddingLeft = "15px";
	return container;
}
function createTile(tile){
	let td = document.createElement("td");
	td.style.position = "relative";
	td.setAttribute("id", (tile.x + "," + tile.y));
	td.setAttribute("onmouseover", "handleOnMouseOver(this)");
	td.setAttribute("onmouseout", "handleOnMouseOut(this)")
	td.setAttribute("height", 500 / dimension);
	td.style.fontSize = (400 / dimension) + "px";
	td.setAttribute("class", "tile");
	td.setAttribute("onclick", "tileClicked(this)");
	colorTile(td);
	if(tile.value != "~"){
		td.innerHTML = tile.value;
	}
	let span = createClueNumber(tile);
	td.appendChild(span);
	return td;
}
function createClueNumber(tile){
	let span = document.createElement("span");
	span.style.position = "absolute";
	span.style.top = "3%";
	span.style.left = "3%";
	var number = document.createTextNode("");
	if(tile.clueA != null){
		number = document.createTextNode(tile.clueA.number);
	}if(tile.clueD != null){
		number = document.createTextNode(tile.clueD.number)
	} 
	span.appendChild(number);
	span.style.fontSize = (140 / (dimension / 1.2)) + "px";
	return span;
}
function colorTile(td){
	let coords = convertCoords(td.id);
	let x = coords[0];
	let y = coords[1];
	let tile = crosswordData[y][x];
	if(tile.state == "black"){
				td.setAttribute("bgcolor", "black");
			}else if(tile.state == "selected"){
				td.setAttribute("bgcolor", "#ffd633");
			}else if(tile.state == "highlighted"){
				td.setAttribute("bgcolor", "#99d7ff");
			}else{
				td.setAttribute("bgcolor", "white");
			}
}








/* MOUSEOVER HANDLERS */

function handleOnMouseOver(element){
	if(addingBlackTiles){
		element.setAttribute("bgcolor", "darkgray");
		element.style.color = "darkgray";
	}
}
function handleOnMouseOut(element){
	element.style.color = "black";
	if(addingBlackTiles){
		colorTile(element);
	}
}
function trashMouseOver(){
	trashIcon.setAttribute("src", "./images/trashHover.png");
}
function trashMouseOut(){
	trashIcon.setAttribute("src", "./images/trash.png");
}
function checkMouseOver(){
	checkIcon.setAttribute("src", "./images/checkHover.png");
}
function checkMouseOut(){
	checkIcon.setAttribute("src", "./images/check.png");
}
function fillMouseOver(){
	fillIcon.setAttribute("src", "./images/fillHover.png");
}
function fillMouseOut(){
	fillIcon.setAttribute("src", "./images/fill.png");
}
function clearMouseOver(){
	clearIcon.setAttribute("src", "./images/clearHover.png");
}
function clearMouseOut(){
	clearIcon.setAttribute("src", "./images/clear.png");
}
function clickMouseOver(){
	clickIcon.setAttribute("src", "./images/clickHover.png");
}
function clickMouseOut(){
	if(addingBlackTiles){
	clickIcon.setAttribute("src", "./images/clickActive.png");
	}else{
		clickIcon.setAttribute("src", "./images/click.png");
	}
}
function containerOnMouseOver(element){
	element.style.backgroundColor = "#99d7ff";
	element.lastChild.style.visibility = "visible";
}
function containerOnMouseOut(element){
	element.style.backgroundColor = "white";
	element.lastChild.style.visibility = "hidden";

}







/* MOVEMENT/NAVIGATION HANDLERS */

document.onkeydown = function(event){
	if(crosswordFocus){
		switch(event.keyCode){
		case 37:
			direction = true;
			handleLeft();
			break;
		case 38:
			direction = false;
			handleUp();
			break;
		case 39:
			direction = true;
			handleRight();
			break;
		case 40:
			direction = false;
			handleDown();
			break;
		case 32:
			direction = !direction;
			break;
		case 8:
			if(selected.value == ""){
				if(direction){
					handleLeft();
				}else{
					handleUp();
				}
			}
			selected.reset();
			break;
		default:
		let e = event.keyCode;
		if((e > 47 && e < 91)
			|| (e > 95 && e < 112)
			|| (e > 159 && e < 165)
			|| (e == 170 || e == 171)
			|| (e > 185 && e < 124)){
			let char = String.fromCharCode(event.keyCode);
			selected.value = char;	
			if(direction){
				handleRight();
			}else{
				handleDown();
			}
		}
	}
	renderCrossword();
	}
}
function tileClicked(element){
	crosswordFocus = true;
	let coords = convertCoords(element.id);
	let tile = crosswordData[coords[1]][coords[0]];
	if(!addingBlackTiles){
		if(tile.state == "black"){
			return;
		}else if(selected == tile){
			direction = !direction;
		}
		selected = tile;
	}else{
		let coords = convertCoords(element.id);
		if(tile.state != "black"){
			tile.black();
		}else{
			tile.state = "blank";
		}
	}
	renderCrossword();
}
function handleRight(){
	var x = 1;
	while((selected.x + x) < (dimension)){
		if(crosswordData[selected.y][selected.x + x].state != "black"){
			selected = crosswordData[selected.y][selected.x + x];
			return;
		}
		x++;
	}
}
function handleLeft(){
	var x = 1;
	while((selected.x - x) > -1){
		if(crosswordData[selected.y][selected.x - x].state != "black"){
			selected = crosswordData[selected.y][selected.x - x];
			return;
		}
		x++;
	}
}
	
function handleUp(){
	var y = 1;
	while((selected.y - y) > -1){
		if(crosswordData[selected.y - y][selected.x].state != "black"){
			selected = crosswordData[selected.y - y][selected.x];
			return;
		}
		y++;
	}
}
function handleDown(){
	var y = 1;
	while((selected.y + y) < (dimension)){
		if(crosswordData[selected.y + y][selected.x].state != "black"){
			selected = crosswordData[selected.y + y][selected.x];
			return;
		}
		y++;
	}
}
createSelectMenu();
resetCrossword();
save();


