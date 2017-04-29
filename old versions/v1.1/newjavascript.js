function checkSupported(){
    canvas = document.getElementById("canvas");
    if(canvas.getContext){
        ctx = canvas.getContext("2d");  
        level = 1;
    }else{
        alert("Sorry bro, but your Browser is shit, try another one!");
    }
}
// ------------------ MAIN FUNCTION ------------------
color = ["green","red","blue","yellow","orange","white","lightblue"]; //Farben Array
function startGame(länge,höhe,blockSize,radiusBall,startY,gridSize,leben,difficulty){
   ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
   document.getElementById("score").innerHTML = 0; //Score-Tafel auf 0 setzen
   
   blocks = []; //Array in welchem die Koordinaten der Blöcke gespeichert werden

   ball = ""; //Startrichtung des Balls
   direction = 0; //Bestimmt die Steigung des Balles (0: 45°, 1: 22,5°)

   gridSizeBall = 3; //Um 'gridSizeBall' Einheiten in X- und Y- Richtung bewegen
   speed = 20; //Wert in Millisekunden, in welchem drawBall() aufgerufen wird
    
   this.leben = leben;
   document.getElementById("lifes").innerHTML = leben;
   
   stickLength = länge; //Setze Stift-Länge  -- Notiz: Tatsächliche Länge ist 10*stickLength (in Pixel) -- 
   stickHeight = höhe; //Stift-Höhe
   currentPositionStick = {'x':60,'y':startY}; //Startposition Stick
   this.gridSize = gridSize; //Definiert Grid-Größe des Sticks (Wert in welchem sich der Stick nach Links oder Rechts bewegt)
   
   radius = radiusBall; //Größe des Balls
   curPosBall = {'x': (currentPositionStick['x'] + 5*stickLength) , 'y': (currentPositionStick['y'] - radius - 1)}; //Startposition Ball in der Mitte des Sticks
    img = document.getElementById("ball");
   
   gridSizeBlocks = blockSize; //Größe der Blöcke
   
   state = ""; //Zustand der Power-Ups
   powerUpEnable = true;
   powerUp = ""; //Animations - Loop
  
   this.difficulty = difficulty;
  
   drawLevel(); //Zeichne Blöcke
   play(); //Starte Game-Loop
}
function lostLife(){
    if(leben != 1){
         pause();
         ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
         currentPositionStick['x'] = 200; //Position des Sticks neu bestimmen
         ball = ""; //Movement resetten
         gridSizeBall = 3; //Speed resetten
         curPosBall = {'x': (currentPositionStick['x'] + 5*stickLength) , 'y': (currentPositionStick['y'] - radius - 1)}; //Position des Balles neu bestimmen
         document.getElementById("lifes").innerHTML = --leben; //Leben abziehen
         powerUpEnable = true; //Damit PowerUp resettet wird
         play(); //Game Loop und zeichnen
    }else{
        pause(); //Spiel anhalten
        score(); //Punkte anschauen und alert Nachricht ausgeben   
        showStartButtons();
    }
}
//------------------------------ GAME OPTIONS ----------------------------------
function play(){ //Game-Loop
  interval = setInterval(drawStick,40);
  intervalBlocks = setInterval(redrawBlocks,100);
  if(ball != ""){ //Falls Spiel einmal pausiert wurde, während der Loop des Balls bereits lief (in onkeydown function)
      intervalBall = setInterval(drawBall,speed); //Nimmt den Loop des Balls wieder auf
  }else{
     drawBall(); //Zeichne Startball   
  }
  if(!powerUpEnable){
    powerUp = setInterval(movePowerUpDown,speedPowerUp);  //Animation d. Power-Ups
  }
  allowPressKeys = true;
}
function pause(){ //Cleared beide Intervalle (Für Stick und Ball)
  clearInterval(interval);
  clearInterval(intervalBall);
  clearInterval(intervalBlocks);
  clearInterval(powerUp);
  allowPressKeys = false;
}
function startMoveBall(){
    if(ball == ""){ //Startet Game-Loop des Balls, wenn Ball noch nicht in Bewegung ist
        ball = "up-left";
        intervalBall = setInterval(drawBall,speed);
        document.getElementById("pause_menu").style.display = "block";
    }
    document.getElementByTag("canvas").style.cursor = "none"; //Macht den Mauszeiger unsichtbar (wird sonst bei Klick kurz sichtbar)
}
function updateScore(){  //Aktualisiere Inhalt des Span-Tags mit der ID = score um jeweils 10
    var a = document.getElementById("score");
    a.innerHTML = parseInt(a.innerHTML) + 10;
}
function levelComplete(){
    if(blocks.length == 0){ //Wenn alle Blöcke zerstört wurden 
        level = 2;
        alert("Nice Dude! Level Complete!\nYour Score: " + document.getElementById("score").innerHTML);
        pause();
        showStartButtons();     
    }
}
// -------------------------------- BLOCKS -------------------------------------
function drawLevel(){
    switch(level){
        case 1:
            drawLevel1();
            break;
        case 2: 
            drawLevel2();
            break;
    }
    document.getElementById("level").innerHTML = level;
}
function drawLevel1(){ //Zeichne LEVEL 1
   var startPosBlocks = {'x': 30, 'y': 20}; //Startposition Links-Oben von der an die Blöcke gezeichnet werden
   colorBlocks = color[random()];
   for(i = 0; i < 650;i = i + 50){ //13 Blöcke in Horizontaler Richtung, jeweils 50 Pixel voneinander entfernt
       var x = startPosBlocks['x'] + i; 
        for(j = 0; j <= 120; j = j + 30){ //4 Blöcke in vertikaler Richtung, je 30 Pixel voneinander entfernt
            var y = startPosBlocks['y'] + j;
            drawShadowBlocks(x,y);
            ctx.fillStyle = colorBlocks;
            ctx.fillRect(x,y,2*gridSizeBlocks,gridSizeBlocks); //zeichne Blöcke, Breite doppelt so groß wie Höhe
            blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
        }
   }
}
function drawLevel2(){ //ZEICHNE LEVEL 2
    var startPosBlocks = {'x': 30, 'y': 20}; //Startposition Links-Oben von der an die Blöcke gezeichnet werden
    colorBlocks = color[random()];
    for(i = 50; i < 600;i = i + 50){ //Zeichne Horizontale Blöcke ganz unten + oben
          var x = startPosBlocks['x'] + i; 
           for(j = 0; j <= 210; j = j + 210){ //4 Blöcke in vertikaler Richtung, je 30 Pixel voneinander entfernt
               var y = startPosBlocks['y'] + j;
               drawShadowBlocks(x,y);
               ctx.fillStyle = colorBlocks;
               ctx.fillRect(x,y,2*gridSizeBlocks,gridSizeBlocks); //zeichne Blöcke, Breite doppelt so groß wie Höhe
               blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
           }
    }
    for(i = 0; i <= 600;i = i + 600){ //Zeichne Vertikale Blöcke an der Seite
          var x = startPosBlocks['x'] + i; 
           for(j = 0; j <= 210; j = j + 30){ 
               var y = startPosBlocks['y'] + j;
               drawShadowBlocks(x,y);
               ctx.fillStyle = colorBlocks;
               ctx.fillRect(x,y,2*gridSizeBlocks,gridSizeBlocks); //zeichne Blöcke, Breite doppelt so groß wie Höhe
               blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
           }
    }
   for(i = 100; i < 550;i = i + 50){ //Zeichne Blöcke im Innenraum
       var x = startPosBlocks['x'] + i; 
        for(j = 60; j <= 150; j = j + 30){ 
            var y = startPosBlocks['y'] + j;
            drawShadowBlocks(x,y);
            ctx.fillStyle = colorBlocks;
            ctx.fillRect(x,y,2*gridSizeBlocks,gridSizeBlocks); //zeichne Blöcke, Breite doppelt so groß wie Höhe
            blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
        }
   }
    
}
function redrawBlocks(){ //Draw Loop der Blöcke
    for(i=0;i<blocks.length;i++){
        drawShadowBlocks(blocks[i][0],blocks[i][1]);
        ctx.fillStyle = colorBlocks; 
        ctx.fillRect(blocks[i][0],blocks[i][1],2*gridSizeBlocks,gridSizeBlocks); //zeichne Blöcke, Breite doppelt so groß wie Höhe
    }
}
function drawShadowBlocks(x,y){
    ctx.fillStyle = "black"; 
    var drawX = x + 0.25*gridSizeBlocks;        
    var drawY = y + 0.25*gridSizeBlocks;
    ctx.fillRect(drawX,drawY,2*gridSizeBlocks,gridSizeBlocks); //zeichne Schatten
}
function hitBlocks(){ //Überprüft ob die 4 Pixel (CurPosBall['x'] +- radius UND CurPosBall['y'] +- radius) ZWISCHEN den Rändern also im Block selbst liegt. 
    for(i = 0; i < blocks.length;i++){
        if(curPosBall['x'] + radius >= blocks[i][0] && curPosBall['x'] + radius <= blocks[i][0] + 2*gridSizeBlocks || //block[i][0] = X-Koordinate
           curPosBall['x'] - radius >= blocks[i][0] && curPosBall['x'] - radius <= blocks[i][0] + 2*gridSizeBlocks){ //block[i][1] = Y-Koordinate
            if(curPosBall['y'] + radius >= blocks[i][1] && curPosBall['y'] + radius <= blocks[i][1] + gridSizeBlocks || 
               curPosBall['y'] - radius >= blocks[i][1] && curPosBall['y'] - radius <= blocks[i][1] + gridSizeBlocks){
                whichWayToGo(); //Kollisionsrichtung
                removeBlock(); //Entferne Block aus Array und von Canvas
                updateScore(); //Aktualisiere Punktestand
                levelComplete(); //Spiel gewonnen?
            }
        }
    }
}
function removeBlock(){ //Entfernt Block aus Canvas und Array
    ctx.clearRect(blocks[i][0],blocks[i][1],2.3*gridSizeBlocks,1.3*gridSizeBlocks); //Lösche Block + Schatten
    newPowerUp();
    blocks.splice(i,1);
}
function whichWayToGo(){ //Kollisionsabfrage mit den Blöcken
    if(!powerBall){
        if(ball == "up-right"){ //Kollision UNTEN oder LINKS
            if(curPosBall['y'] >= blocks[i][1] + gridSizeBlocks ){ //Y-Wert des Balls größer als unterster Pixel des Blocks?
                ball = "down-right"; //Ball trifft untere Seite
            }else{
                ball = "up-left"; //Ball trifft Linke Seite
            }
        }else if(ball == "up-left"){ //Kollision UNTEN oder RECHTS
            if(curPosBall['y'] >= blocks[i][1]+ gridSizeBlocks){ //Y-Wert des Balls größer als unterster Pixel des Blocks?
                ball = "down-left"; //Ball trifft untere Seite
            }else{
                ball = "up-right"; //Ball trifft rechte Seite
            }   
        }else if(ball == "down-left"){ //Kollision OBEN oder RECHTS
            if(curPosBall['y'] >= blocks[i][1]){ //Y-Wert des Balls größer als oberster Pixel-Wert des Blocks?
                 ball = "down-right"; //Ball trifft rechte Seite
            }else{
                 ball = "up-left"; //Ball trifft Obere Seite
            }   
        }else if(ball == "down-right"){ //Kollision OBEN oder LINKS
            if(curPosBall['y'] >= blocks[i][1]){ //Y-Wert des Balls größer als oberster Pixel-Wert des Blocks?
                ball = "down-left"; //Ball trifft Linke Seite
            }else{
                ball = "up-right"; //Ball trifft Obere Seite
            }
        }
    }
}
// ----------------------------- BALL -------------------------------------

function drawBall(){ //Wird wiederholt in play() aufgerufen  
    ctx.clearRect(curPosBall['x'] - radius-1, curPosBall['y'] - radius-1, 2*radius+2,2*radius+2); // Lösche BALL
    
    hitStick(); //Überprüfe auf Kollision mit Spieler 
    hitBorderBall(); //Überprüfe auf Kollision mit Wand
    hitBlocks(); //Überprüfe auf Kollision mit Blöcken
    ballDirection(); //Regele die Richtung des Balles und ändere die aktuellen X- und Y- Koordinaten
    
  
    ctx.drawImage(img,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
}
function ballDirection(){ //Berechnet die Bewegung des Balls in die jeweilige Richtung
    if(direction == 0){ //Alpha = 45°
            switch(ball){
              case "up-right":
                  curPosBall['x'] = curPosBall['x'] + gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] - gridSizeBall;
                  break;
              case "down-right":
                  curPosBall['x'] = curPosBall['x'] + gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] + gridSizeBall;
                  break;
              case "down-left":
                  curPosBall['x'] = curPosBall['x'] - gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] + gridSizeBall;
                  break;
              case "up-left":
                  curPosBall['x'] = curPosBall['x'] - gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] - gridSizeBall;
                  break;
            }
        }else if(direction == 1){      //Alpha = 22,5°
            switch(ball){
              case "up-right":
                  curPosBall['x'] = curPosBall['x'] + 1.5*gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] - 0.75*gridSizeBall;
                  break;
              case "down-right":
                  curPosBall['x'] = curPosBall['x'] + 1.5*gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] + 0.75*gridSizeBall;
                  break;
              case "down-left":
                  curPosBall['x'] = curPosBall['x'] - 1.5*gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] + 0.75*gridSizeBall;
                  break;
              case "up-left":
                  curPosBall['x'] = curPosBall['x'] - 1.5*gridSizeBall;
                  curPosBall['y'] = curPosBall['y'] - 0.75*gridSizeBall;
                  break;
            }
        }
}
function hitBorderBall(){ //Kollisionsabfrage des Balls mit den Rändern des Canvas Elements.
    if(curPosBall['y'] <= radius){ //Oberer Rand
        if(ball == "up-right"){
             ball = "down-right";
         }else{
             ball = "down-left";
         }
    }else if(curPosBall['x'] >= canvas.width - radius){ //Rechter Rand
        if(ball == "down-right"){
             ball = "down-left";
         }else{
             ball = "up-left";
         }
    }else if(curPosBall['y'] >= canvas.height - radius){ //Unterer Rand
        lostLife();
    }else if(curPosBall['x'] <= radius){ //Linker Rand
        if(ball == "down-left"){
            ball = "down-right";
        }else{
            ball = "up-right";
        }
    }    
}
//---------------------------------- Stick -------------------------------------
function hitStick(){  //Kollisionsabfrage mit Ball
       if(curPosBall['y'] + radius >= currentPositionStick['y']){ //Unterster Punkt des Balls größer/gleich der Höhe des oberen Randes des Sticks?
               if(curPosBall['x'] + radius >= currentPositionStick['x'] && curPosBall['x'] + radius <= currentPositionStick['x'] + 10*stickLength || //Ball (Also die Pixel des X-Wertes +- Radius) Zwischen den X-Werten des Randes des Sticks?
                  curPosBall['x'] - radius >= currentPositionStick['x'] && curPosBall['x'] - radius <= currentPositionStick['x'] + 10*stickLength){
                   if(curPosBall['x'] <= currentPositionStick['x'] + 5*stickLength){ //Befindet sich der Ball auf der linken Hälfte, fliegt er dementsprechend auch nach Links oder umgekehrt.
                       if(curPosBall['x'] <= currentPositionStick['x'] + 2*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                           direction = 1;
                       }else{
                           direction = 0;
                       }
                        ball = "up-left";
                   }else{
                       if(curPosBall['x'] >= currentPositionStick['x'] + 8*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                           direction = 1;
                       }else{
                           direction = 0;
                       }
                       ball = "up-right";
                   }
               }
           }
       
}
function drawStick(){ //Loop in play(), stick wird permanent neu gezeichnet. 
    var img = document.getElementById("stick");
    ctx.drawImage(img,currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); 
}
function moveRight(){
    var img = document.getElementById("stick");
     if(currentPositionStick['x'] + 10*stickLength >= canvas.width){ //Kollisionsabfrage, falls Spieler an Rand gerät
            return null;
         }else{
                ctx.clearRect(currentPositionStick['x'],currentPositionStick['y'],10*stickLength + 1,stickHeight); //Lösche aktuellen Stick
                currentPositionStick['x'] = currentPositionStick['x'] + gridSize; //Erhöhe den X-Wert
                ctx.drawImage(img,currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); 
                
                if(ball == ""){ //Wenn Ball noch nicht gestartet ist, bewegt er sich dem Stick entsprechend
                    moveBallAtStart(gridSize);
                }
           }  
}
function moveLeft(){
    var img = document.getElementById("stick");
    if(currentPositionStick['x'] <= 0 ){ //Kollisionsabfrage, falls Spieler an Rand gerät
            return null;
         }else{
            ctx.clearRect(currentPositionStick['x'],currentPositionStick['y'],10*stickLength + 1,stickHeight); //Lösche aktuellen Stick
            currentPositionStick['x'] = currentPositionStick['x'] - gridSize; //Verringere den X-Wert
            ctx.drawImage(img,currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); 
            
            if(ball == ""){ //Wenn Ball noch nicht gestartet ist, bewegt er sich dem Stick entsprechend
                moveBallAtStart(-gridSize);
            }
        }      
}
function moveBallAtStart(a){
    ctx.clearRect(curPosBall['x'] - radius-1, curPosBall['y'] - radius-1, 2*radius+2,2*radius+2);
        curPosBall['x'] = curPosBall['x'] + a; //Neue Position des Balls
    var img = document.getElementById("ball");
    ctx.drawImage(img,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
}
//-------------------------------- POWER UPS -----------------------------------
speedPowerUp = 20;
Psize = 30;
powerBall = false;
function newPowerUp(){
    if(powerUpEnable){
        randomPowerUp(); //Generiere Zufälliges Power-Up
        xPow = blocks[i][0] + gridSizeBlocks; //Setze Startposition auf Position des zerstörten Blocks
        yPow = blocks[i][1] + 0.5*gridSizeBlocks;
        ctx.drawImage(icon,xPow,yPow,Psize,Psize);
        powerUpEnable = false;
        powerUp = setInterval(movePowerUpDown,speedPowerUp);   //starte Animations-Loop
    }
}
function randomPowerUp(){
    r = random();
    switch(r){
        case 0:
            state = "smallStick";
            icon = document.getElementById("small");
            break;
        case 1:
            if(10*stickLength < 0.5*canvas.width){ //Verhindert, dass Schläger niemals größer als Cnavas selbst sein kann
                state = "largeStick";
                icon = document.getElementById("tall");
            }else{
                state = "smallStick";
                icon = document.getElementById("small");
            }
            break;
        case 2:
            state = "fasterBall";
            icon = document.getElementById("fast");
            break;
        case 3: 
            state = "slowerBall";
            icon = document.getElementById("slow");
            break;
        case 4:
            state = "powerBall";
            icon = document.getElementById("fireball");
            break;
        case 5:
            state = "moreLifes";
            icon = document.getElementById("heart");
            break;
        default:
            break;       
    }
}
function movePowerUpDown(){ //Animations-Loop des Power-Ups
    if(yPow < canvas.height){  
        ctx.clearRect(xPow,yPow,Psize,Psize); //Lösche Power-Up
        yPow += 1; //Y-Einheiten in welchem das Power-Up sich nach unten bewegt
        ctx.drawImage(icon,xPow,yPow,Psize,Psize); //Zeichne Power-Up
        if(yPow + Psize >= currentPositionStick['y'] && xPow + Psize >= currentPositionStick['x'] && xPow <= currentPositionStick['x'] + 10*stickLength){ //Kollisionsabfrage
            ctx.clearRect(xPow,yPow,Psize,Psize); //Lösche Power-Up aus Canvas
            clearInterval(powerUp); //Lösche Intervall des Power-Ups
            choosePowerUp();
            powerUpEnable = true; //Neues Power Up möglich
        }
    }else{
        clearInterval(powerUp);
        powerUpEnable = true;
    }
}
function choosePowerUp(){
     switch(state){
        case "smallStick":
           smallStick(); 
           break;
        case "largeStick":
           largeStick();
           break;
        case "fasterBall":
            fasterBall();
            break;
        case "slowerBall":
            slowerBall();
            break;
        case "powerBall":
            powerBall = true;
            img = document.getElementById("fireball");
            setTimeout(resetPowerBall,10000); //Reset nach 10 Sek.
            break;
        case "moreLifes":
            leben++;
            document.getElementById("lifes").innerHTML = leben;
            break;
    }
}
//POWER UP: KLEINER STICK
function smallStick(){
    ctx.clearRect(currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); //Lösche aktuellen Stick
    stickLength *= 0.5;
    ctx.fillStyle = "grey";
    ctx.fillRect(currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); //Zeichne neuen Stick
}
//POWER UP: GRÖßERER STICK
function largeStick(){
        stickLength *= 1.5;
        ctx.fillStyle = "grey";
        ctx.fillRect(currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); //Zeichne neuen Stick
}
//POWER UP: SCHNELLERER BALL
function fasterBall(){
    gridSizeBall++;
}
//POWER UP: LANGSAMERER BALL
function slowerBall(){
    if(gridSizeBall > 1){
        gridSizeBall--;
    }
}
//POWER UP: Power Ball ------ RESET FÜR POWER UP nach 10 SEKUNDEN
function resetPowerBall(){
    powerBall = false;
    img = document.getElementById("ball");
}

//-------------------- EVENT-REGLER FÜR TASTATUREINGABE ------------------------
document.onkeydown = function(event){
  if (!allowPressKeys){
    return null;
  }
  var keyCode; 
  if(event == null)
  {
    keyCode = window.event.keyCode; 
  }
  else 
  {
    keyCode = event.keyCode; 
  }
   switch(keyCode)
   {
        case 37: //Left Key
           moveLeft();
           break;     
        case 38: //Up Key
            redrawBlocks();
            startMoveBall();
            break;
        case 39: //Right Key
            moveRight();
            break;   
        case 40: //Down Key
            if(difficulty == "veryEasy" || difficulty == "Easy"){ //Cheaten
                ctx.clearRect(blocks[0][0],blocks[0][1],2.25*gridSizeBlocks,1.25*gridSizeBlocks);
                blocks.splice(0,1);
                levelComplete();
            }else{ //gridSize bei den anderen Schwierigkeiten erhöhen
                gridSizeBall++;
            }
            break;
        default:
            break;
   } 
};
//----------------------------- MAUS -------------------------------------------
function moveWithMouse(){
    if(allowPressKeys){
        var x = -0.5*window.innerWidth + 0.5*canvas.width + window.event.clientX - 5*stickLength; //Aktuelle Position der Mitte des Stick (Linker Rand von Canvas X=0)
        if(x > currentPositionStick['x'] + gridSizeBlocks ){
             moveRight();
        }else if(x < currentPositionStick['x'] - gridSizeBlocks){
            moveLeft();
        }   
    }
}
//------------------------------ SONSTIGES -------------------------------------
function score(){ //Ausgaben für jeweilige Punktanzahl
    var score = document.getElementById("score").innerHTML;
    if(score <= 100){
        alert("You Suck!! \nYour Score was only " + document.getElementById("score").innerHTML + ".\nMaybe try the 'Very Easy' Mode?");
    }else if(score > 100 && score < 300){
        alert("Learn to Play Noob! \nYour Score: " + document.getElementById("score").innerHTML + ".");
    }else if(score >= 300 && score < 650){
        alert("Not Bad, dude!\nYour Score: " + document.getElementById("score").innerHTML + ".\nIm sure, you will become a Pro-Gamer!");
    }
}
function buttonStart(){
    document.getElementById("play_menu").style.display = "none";
}
function showStartButtons(){
    document.getElementById("play_menu").style.display = "block";
    document.getElementById("pause_menu").style.display = "none";
}
function random(){ //Zufallszahlen-Generator 
    var a = Math.random() * 6;
    return (Math.round(a));
}
//------------------------------- HEADLINE -------------------------------------
function startCrazyText(){ //Aktiv bei Hover über Headline
    text = setInterval(atariBreakout,30);    
}
function stopCrazyText(){
    clearInterval(text);
}
function atariBreakout(){
    var a = document.getElementById("headline");
    a.style.color = color[random()];
    var size = ["250%","255%","260%","265%","270%"];
    a.style.fontSize = size[random()];
    var rotate = [-6,-3,0,3,6];
    a.style.transform = "rotate(" + rotate[random()] +"deg)";
    var move = [6,3,0,-3,-6];
    a.style.top = "" + move[random()] +"px";
    a.style.left = "" + move[random()] +"px"; 
}
function trololo(){
    var t = document.getElementById("trololo");
    t.style.display = "block";
}
 //--------------------------ERROR HANDLER --------------------------------
OnError = errorHandler 
function errorHandler(message,url,line){
    out = "Ein Fehler ist aufgetreten:";
    out += "Fehlermeldung: " + message;
    out += "in Zeile " + line;
    alert(out);
    return true; 
}