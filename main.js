var bgImg = document.createElement("img");
bgImg.src = "images/map.png";


var enemyImg = document.createElement("img");
enemyImg.src = "images/slime.gif";

var towerBtnImg = document.createElement("img");
towerBtnImg.src = "images/tower-btn.png";

var towerImg = document.createElement("img");
towerImg.src = "images/tower.png";

var crosshairImg = document.createElement("img");
crosshairImg.src = "images/crosshair.png";

var cannonballImage = document.createElement("img");
cannonballImage.src = "images/cannon-ball.png";


var fps = 60; 
var treehp = 100;
var score = 0;


var enemyPath = [
	{x:96, y:64},
    {x:384, y:64},
    {x:384, y:192},
    {x:224, y:192},
    {x:224, y:320},
    {x:544, y:320},
    {x:544, y:96}
]

function Enemy(){
	this.x = 96;
	this.y = 448;
	this.speed = 64;
	this.pathDes = 0;
	this.direction ={x:0,y:-1};
	this.hp = 10;
	this.end = false;
	this.move = function(){

		if(isCollided(enemyPath[this.pathDes].x,enemyPath[this.pathDes].y,this.x,this.y,this.speed/fps,this.speed/fps)){
			this.x = enemyPath[this.pathDes].x;
			this.y = enemyPath[this.pathDes].y;
			this.pathDes++;

			if(this.pathDes == enemyPath.length){
				this.hp = 0;
				this.end = true;
				treehp -= 10;
				if(treehp<=0){
					gameover()
				}

			}

			var unitVector = getUnitVector(this.x,this.y,enemyPath[this.pathDes].x,enemyPath[this.pathDes].y);
			this.direction = unitVector;
		}
		else{

			this.x = this.x + this.direction.x * this.speed/fps;
			this.y = this.y + this.direction.y * this.speed/fps;
		}
	}
}

function Cannonball(tower){
	this.speed = 320;
	this.damage = 5;
	this.hitted = false;
	var aimedEnemy = enemies[tower.aimingEnemyId];
    this.x = tower.x+16;
    this.y = tower.y;
    this.direction = getUnitVector(this.x, this.y, aimedEnemy.x, aimedEnemy.y);
    this.move = function(){ 	
    	this.x += this.direction.x*this.speed/fps; 	
    	this.y += this.direction.y*this.speed/fps; 
    	for(var i = 0;i<enemies.length;i++){
    		this.hitted = isCollided(this.x,this.y,enemies[i].x,enemies[i].y,32,32);
    		if(this.hitted){
    			enemies[i].hp -= this.damage
    			break;
    		}
    	}
    }


}


var cannonballs = [];
var towers = [];




function Tower(x,y){
	this.x = x;
	this.y = y;
	this.range = 96;
	this.aimingEnemyId = null;
	this.firstRate = 1;
	this.readyToShootTime = 1;
	this.searchEnemy = function(){
		this.readyToShootTime -= 1/fps;
		for(var i=0; i<enemies.length; i++){
			var distance = Math.sqrt(Math.pow(this.x-enemies[i].x,2) + Math.pow(this.y-enemies[i].y,2));
			if (distance<=this.range) {
				this.aimingEnemyId = i;
				if (this.readyToShootTime<=0) {
            		this.shoot();
            		this.readyToShootTime = this.firstRate;
        		};
				return;
			}
		}
		this.aimingEnemyId = null;
	};
	this.shoot = function(){
		var newCannonball = new Cannonball(this);
		cannonballs.push(newCannonball);
	};

}

var isbiding = false;


var enemies = [];
var clock = 0;
var click = false;
var order = -1;

var tower = {
	x:0,
	y:0
}




var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext('2d');

$('#game-canvas').mousemove(function(event){
	if(click == false){
		tower.x = event.offsetX;
		tower.y = event.offsetY;
	}
})
 

$('#game-canvas').click(function(){
	if((tower.x>640-64)&&(tower.y>480-64)){
		if(isbiding){
			isbiding = false;

		}else{
			isbiding = true;
		}
		click = false;
	}else{
		click = true;
	}
})


function isCollided ( pointX, pointY, targetX, targetY, targetWidth, targetHeight ) {
	if(     pointX >= targetX
	        &&  pointX <= targetX + targetWidth
	        &&  pointY >= targetY
	        &&  pointY <= targetY + targetHeight
	){
	        return true;
	} else {
	        return false;
	}
}

function getUnitVector (srcX, srcY, targetX, targetY) {
    var offsetX = targetX - srcX;
    var offsetY = targetY - srcY;
    var distance = Math.sqrt( Math.pow(offsetX,2) + Math.pow(offsetY,2) );
    var unitVector = {
        x: offsetX/distance,
        y: offsetY/distance
    };
    return unitVector;
}



function draw(){
	clock = clock + 1;

	if(clock%80==0){
		var newenemy = new Enemy();
		enemies.push(newenemy);
	}


	ctx.drawImage(bgImg,0,0);



	for(var i=0;i<enemies.length;i++){

		if(enemies[i].hp<=0){
			if(!enemies[i].end){
				score += 10;
			}
			
			enemies.splice(i,1);
			 
		}else{
			ctx.drawImage(enemyImg,enemies[i].x,enemies[i].y);
			enemies[i].move();
		}
	}



	ctx.font = "24px Arial";
	ctx.fillStyle = "White";
	ctx.fillText("hp:"+treehp,30,30);
	ctx.fillText("score:"+score,30,50);

	ctx.drawImage(towerBtnImg,640-64,480-64,64,64);

	if(isbiding){
		ctx.drawImage( towerImg, tower.x, tower.y );
	}

	if(click){
		var newtower = new Tower(tower.x,tower.y);
		towers.push(newtower);
		click = false;

	}


	for (var i=0; i<towers.length; i++){
		towers[i].searchEnemy();
		ctx.drawImage(towerImg,towers[i].x-towers[i].x%32,towers[i].y-towers[i].y%32);
		if ( towers[i].aimingEnemyId!=null ) {
	    	var id = towers[i].aimingEnemyId;
	    	ctx.drawImage( crosshairImg, enemies[id].x, enemies[id].y );
		}
	}

	for (var i=0; i<cannonballs.length; i++){
		cannonballs[i].move();
		if((cannonballs[i].hitted)){
			cannonballs.splice(i,1);
		}else if((cannonballs[i].x<0)&&(cannonballs[i].x>640)){
			cannonballs.splice(i,1);
		}else if((cannonballs[i].y<0)&&(cannonballs[i].y>480)){
			cannonballs.splice(i,1);
		}
		else{
			ctx.drawImage(cannonballImage,cannonballs[i].x,cannonballs[i].y);
		}
	}

	context.clearRect(bgImg,0,0);
}

var intervalID = setInterval(draw,1000/fps);


function gameover(){
    ctx.textAlign = "center";
    ctx.font = "64px Arial";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2-96);
    ctx.font = "48px Arial";
    ctx.fillText("you got", canvas.width/2, canvas.height/2-32);
    ctx.font = "128px Arial";
    ctx.fillText(score, canvas.width/2, canvas.height/2+96);
    clearInterval(intervalID);
}

