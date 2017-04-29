function checkSupported(){
    canvas = document.getElementById("canvas");
    canvas2 = document.getElementById("canvas2");
    if(canvas.getContext){
        ctx = canvas.getContext("2d");  
        ctx2 = canvas2.getContext("2d");
        level = 1;
    }else{
        alert("Sorry bro, but your Browser is shit, try another one!");
    }
}
// ------------------ MAIN FUNCTION ------------------
color = ["green","red","blue","yellow","orange","violet","lightblue"]; //Farben Array

function startGame(länge,höhe,blockSize,radiusBall,startY,GridSize,Leben,Difficulty){
   ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
   document.getElementById("score").innerHTML = 0; //Score-Tafel auf 0 setzen
   
   blocks = []; //Array in welchem die Koordinaten der Blöcke gespeichert werden

   ball = ""; //Startrichtung des Balls
   direction = 0; //Bestimmt die Steigung des Balles (0: 45°, 1: 22,5°)
   xAlpha = 1;
   yAlpha = 1;

   gridSizeBall = 3; //Um 'gridSizeBall' Einheiten in X- und Y- Richtung bewegen
   speed = 20; //Wert in Millisekunden, in welchem drawBall() aufgerufen wird
    
   leben = Leben;
   document.getElementById("lifes").innerHTML = leben;
   
   stickLength = länge; //Setze Stift-Länge  -- Notiz: Tatsächliche Länge ist 10*stickLength (in Pixel) -- 
   stickHeight = höhe; //Stift-Höhe
   currentPositionStick = {'x':60,'y':startY}; //Startposition Stick
   imgStick = document.getElementById("stick"); //Bild des sticks
   gridSize = GridSize; //Definiert Grid-Größe des Sticks (Wert in welchem sich der Stick nach Links oder Rechts bewegt)
   
   radius = radiusBall; //Größe des Balls
   curPosBall = {'x': (currentPositionStick['x'] + 5*stickLength) , 'y': (currentPositionStick['y'] - radius)}; //Startposition Ball in der Mitte des Sticks
   imgBall = document.getElementById("ball"); //Aussehen des Balls
   powerBall = false; //Bestimmt ob powerBall aktiv ist (keine Kollision mit blöcken)
   
   gridSizeBlocks = blockSize; //Größe der Blöcke
   
   powerUp = []; //Intervalle der Power-Ups
   indexPowerUp = 0; //Zählt Menge der Power Ups
   state = ""; //Speichert Zustand d. Power Ups
     
   shootPossible = false; //Schießen nicht möglich
   intervalShoot = []; //Speichert für jeden Schuss das Intervall in einem Array
   indexShoot = 0;
   
   flip = false; //Kehre Steuerung um
   timeout = ""; //Initialisieren, timeout fürs Schießen
   timeoutPowerBall = ""; //Initialisieren, timeout für PowerBall
   
   intervalAutopilot = ""; //Intervall des Autopilots
   timeoutAutopilot = ""; //Variable um timeout zu resetten (bei wiederholter Aufnahme d. Power Ups)
   
   timeoutBomb = ""; //Timeout zum Reset für PowerUp-Bomb
   bomb = false; //Bestimmt ob aktiv oder nicht
   
   indexTextPopUp = 0; //Zählt Index Hoch um Intervalle der Text-PopUps zu löschen
   textPopUp = []; //Speichert Text-PopUps 
   
   positionPowerUpPopUp = 0; //speichert Position des Pop-Ups
   PowerUpPopUpInterval = []; //Array der Pop-Ups in Canvas 2
   
   difficulty = Difficulty;
   //----Kästerlevel----
   kästerfire = true;
   timeoutFire = "";
   speedFireKäster = 2000;
   laser = 10;
   
   drawLevel();
   play(); //Starte Game-Loop
}
//------------------------------ GAME OPTIONS ----------------------------------
function play(){ //Game-Loop
  ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
  interval = setInterval(drawStick,30);
  intervalBlocks = setInterval(redrawBlocks,100);
  if(ball != ""){ //Falls Spiel einmal pausiert wurde, während der Loop des Balls bereits lief (in onkeydown function)
      intervalBall = setInterval(drawBall,speed); //Nimmt den Loop des Balls wieder auf    
  }
  if(timeoutFire != ""){
      timeoutFire = setTimeout(kästerFire,speedFireKäster);
  }
  drawStartBall(); //Zeichne Startball  
  allowPressKeys = true;   
}
function pause(){ //Cleared alle Intervalle
  clearInterval(interval);
  clearInterval(intervalBall);
  clearInterval(intervalBlocks);
  for(var k = 0;k<powerUp.length;k++){
      clearInterval(powerUp[k]);
  }
  for(var z = 0;z<intervalShoot.length;z++){
      clearInterval(intervalShoot[z]);
  }
  clearTimeout(timeoutFire);
  clearCanvas2();
  allowPressKeys = false;
}
function startMoveBall(){
    if(ball == "" && level != "Käster"){ //Startet Game-Loop des Balls, wenn Ball noch nicht in Bewegung ist
        ball = "up-left";
        intervalBall = setInterval(drawBall,speed);
        document.getElementById("pause_menu").style.display = "block";
    }
    if(shootPossible){
        shoot();
    }
    if(level == "Käster" && kästerfire){
        newPowerUpPopUp("kästerBall",30);
        ball = "right";
        intervalBall = setInterval(drawBall,speed);
        document.getElementById("pause_menu").style.display = "block";
        kästerFire();
        kästerfire = false;
    }
    document.getElementByTag("canvas").style.cursor = "none"; //Macht den Mauszeiger unsichtbar (wird sonst bei Klick kurz sichtbar)
}
function updateScore(){  //Aktualisiere Inhalt des Span-Tags mit der ID = score um jeweils 10
    var a = document.getElementById("score");
    a.innerHTML = parseInt(a.innerHTML) + 10;
}
function levelComplete(){
    if(blocks.length == 0){ //Wenn alle Blöcke zerstört wurden 
        level++;
        alert("Nice Dude! Level Complete!\nTry the next Level!\nYour Score: " + document.getElementById("score").innerHTML);
        pause();
        showStartButtons();     
    }
}
function lostLife(){
    if(leben != 1){
         pause();
         ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
         currentPositionStick['x'] = 200; //Position des Sticks neu bestimmen
         ball = ""; //Movement resetten
         direction = 0; //Steigung resetten
         resetPowerUp("autopilot");
         resetPowerUp("powerBall");
         resetPowerUp("bomb"); 
         resetPowerUp("gun");
         clearCanvas2();
         if(level != "Käster"){
             gridSizeBall = 3; //Speed resetten
         }
         curPosBall = {'x': (currentPositionStick['x'] + 5*stickLength) , 'y': (currentPositionStick['y'] - radius - 1)}; //Position des Balles neu bestimmen
         document.getElementById("lifes").innerHTML = --leben; //Leben abziehen
         play(); //Game Loop und zeichnen
    }else{
        pause(); //Spiel anhalten
        score(); //Punkte anschauen und alert Nachricht ausgeben   
        showStartButtons();
    }
}
// -------------------------------- LEVEL --------------------------------------
function drawShadowBlocks(x,y){
    ctx.fillStyle = "black"; 
    var drawX = x + 0.25*gridSizeBlocks;        
    var drawY = y + 0.25*gridSizeBlocks;
    ctx.fillRect(drawX,drawY,2*gridSizeBlocks,gridSizeBlocks); //zeichne Schatten
}
function drawLevel(){
    switch(level){
        case 1:
            drawLevel1();
            document.getElementById("canvas").style.backgroundImage = "url(background/green.png)";
            document.getElementById("headline").innerHTML = "Block Breaker";
            break;
        case 2: 
            drawLevel2();
            document.getElementById("canvas").style.backgroundImage = "url(background/bird.jpg)";
              document.getElementById("headline").innerHTML = "Block Breaker";
            break;
        case 3:
            drawLevel3();
            document.getElementById("canvas").style.backgroundImage = "url(background/level3.jpg)";
              document.getElementById("headline").innerHTML = "Block Breaker";
            break;
        case "Käster":
            kästerBall();        
            break;
    }
    document.getElementById("level").innerHTML = level;
}
function drawLevel1(){ //Zeichne LEVEL 1
   var startPosBlocks = {'x': 30, 'y': 20}; //Startposition Links-Oben von der an die Blöcke gezeichnet werden
   colorBlocks = color[Math.round(Math.random() * 5)];
   for(var i = 0; i < 650;i = i + 50){ //13 Blöcke in Horizontaler Richtung, jeweils 50 Pixel voneinander entfernt
       var x = startPosBlocks['x'] + i; 
        for(var j = 0; j <= 120; j = j + 30){ //4 Blöcke in vertikaler Richtung, je 30 Pixel voneinander entfernt
            var y = startPosBlocks['y'] + j;
            blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
        }
   }
}
function drawLevel2(){ //ZEICHNE LEVEL 2
    var startPosBlocks = {'x': 30, 'y': 20}; //Startposition Links-Oben von der an die Blöcke gezeichnet werden
    colorBlocks = color[Math.round(Math.random() * 5)];
    for(var i = 50; i < 600;i = i + 50){ //Zeichne Horizontale Blöcke ganz unten + oben
          var x = startPosBlocks['x'] + i; 
           for(var j = 0; j <= 210; j = j + 210){ //4 Blöcke in vertikaler Richtung, je 30 Pixel voneinander entfernt
               var y = startPosBlocks['y'] + j;
               blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
           }
    }
    for(var i = 0; i <= 600;i = i + 600){ //Zeichne Vertikale Blöcke an der Seite
          var x = startPosBlocks['x'] + i; 
           for(var j = 0; j <= 210; j = j + 30){ 
               var y = startPosBlocks['y'] + j;
               blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
           }
    }
   for(var i = 100; i < 550;i = i + 50){ //Zeichne Blöcke im Innenraum
       var x = startPosBlocks['x'] + i; 
        for(var j = 60; j <= 150; j = j + 30){ 
            var y = startPosBlocks['y'] + j;
            blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
        }
   }
    
}
function drawLevel3(){
    var startPosBlocks = {'x': 30, 'y': 20}; //Startposition Links-Oben von der an die Blöcke gezeichnet werden
    colorBlocks = color[Math.round(Math.random() * 5)];
    for(var i = 50; i < 600;i = i + 50){ //Zeichne Horizontale Blöcke ganz unten + oben
        var x = startPosBlocks['x'] + i;          
        var y = startPosBlocks['y'];
        blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten         
    }
     for(var i = 0; i <= 600;i = i + 600){ //Zeichne Vertikale Blöcke an der Seite
          var x = startPosBlocks['x'] + i; 
           for(var j = 0; j <= 330; j = j + 30){ 
               var y = startPosBlocks['y'] + j;
               blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten
           }
     }
     for(var i = 100; i < 550;i = i + 50){ //Zeichne Horizontale Blöcke ganz unten + oben 
        var x = startPosBlocks['x'] + i;   
        if(i == 100){
            var y = startPosBlocks['y'] + 220;
            blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten      
        }
        if(i == 500){
            var y = startPosBlocks['y'] + 220;
            blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten 
        }
        var y = startPosBlocks['y'] + 250;
        blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten         
    }
    
    for(var i = 180; i < 500;i = i + 250){ //Zeichne Horizontale Blöcke ganz unten + oben
        var x = startPosBlocks['x'] + i;          
        var y = startPosBlocks['y'] + 100;
        blocks.push([x,y]); //Fülle Array 'blocks' mit den Block-Koordinaten         
    }  
}
function redrawBlocks(){ //Draw Loop der Blöcke
    for(var i=0;i<blocks.length;i++){
        drawShadowBlocks(blocks[i][0],blocks[i][1]);
        ctx.fillStyle = colorBlocks; 
        ctx.fillRect(blocks[i][0],blocks[i][1],2*gridSizeBlocks,gridSizeBlocks); //zeichne Blöcke, Breite doppelt so groß wie Höhe
    }
}
function hitBlocks(){ //Überprüft ob die 4 Pixel (CurPosBall['x'] +- radius UND CurPosBall['y'] +- radius) ZWISCHEN den Rändern also im Block selbst liegt. 
    for(var i = 0; i < blocks.length;i++){
        if(curPosBall['x'] + radius >= blocks[i][0] && curPosBall['x'] + radius <= blocks[i][0] + 2*gridSizeBlocks || //block[i][0] = X-Koordinate
           curPosBall['x'] - radius >= blocks[i][0] && curPosBall['x'] - radius <= blocks[i][0] + 2*gridSizeBlocks){ //block[i][1] = Y-Koordinate
            if(curPosBall['y'] + radius >= blocks[i][1] && curPosBall['y'] + radius <= blocks[i][1] + gridSizeBlocks || 
               curPosBall['y'] - radius >= blocks[i][1] && curPosBall['y'] - radius <= blocks[i][1] + gridSizeBlocks){
                whichWayToGo(i); //Kollisionsrichtung
                newPowerUp(i);
                removeBlock(i); //Entferne Block aus Array und von Canvas
                updateScore(); //Aktualisiere Punktestand
                levelComplete(); //Spiel gewonnen?
            }
        }
    }
}
function removeBlock(i){ //Entfernt Block aus Canvas und Array
    ctx.clearRect(blocks[i][0],blocks[i][1],2.3*gridSizeBlocks,1.3*gridSizeBlocks); //Lösche Block + Schatten
    blocks.splice(i,1);   
}
function whichWayToGo(i){ //Kollisionsabfrage mit den Blöcken
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
function drawStartBall(){
    ctx.drawImage(imgBall,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
}
function drawBall(){ //Wird wiederholt in play() aufgerufen  
    ctx.clearRect(curPosBall['x'] - radius, curPosBall['y'] - radius, 2*radius,2*radius); // Lösche BALL
       
    if(level != "Käster"){
        hitBorderBall(); //Überprüfe auf Kollision mit Wand
        hitStick(); //Überprüfe auf Kollision mit Spieler     
        hitBlocks(); //Überprüfe auf Kollision mit Blöcken
        ballDirection(); //Regele die Richtung des Balles und ändere die aktuellen X- und Y- Koordinaten
    }else{
        moveKäster();
        hitBorderKäster();
    }
       
    ctx.drawImage(imgBall,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
}
function ballDirection(){ //Berechnet die Bewegung des Balls in die jeweilige Richtung
    switch(direction){
        case 0:
            xAlpha = 1;
            yAlpha = 1;
            break;
        case 1:
            xAlpha = 1.5;
            yAlpha = 0.75;
            break;
    }
        switch(ball){
          case "up-right":
              curPosBall['x'] = curPosBall['x'] + xAlpha*gridSizeBall;
              curPosBall['y'] = curPosBall['y'] - yAlpha*gridSizeBall;
              break;
          case "down-right":
              curPosBall['x'] = curPosBall['x'] + xAlpha*gridSizeBall;
              curPosBall['y'] = curPosBall['y'] + yAlpha*gridSizeBall;
              break;
          case "down-left":
              curPosBall['x'] = curPosBall['x'] - xAlpha*gridSizeBall;
              curPosBall['y'] = curPosBall['y'] + yAlpha*gridSizeBall;
              break;
          case "up-left":
              curPosBall['x'] = curPosBall['x'] - xAlpha*gridSizeBall;
              curPosBall['y'] = curPosBall['y'] - yAlpha*gridSizeBall;
              break;         
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
        if(bomb){ //POWERUP : BOMBE --> prallt vom Boden ab
            if(ball == "down-right"){
                ball = "up-right";
            }else{
                ball = "up-left";
            }
        }else{
            lostLife(); //Leben verlieren
        }
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
                    if(bomb){ //POWERUP: BOMBE
                        lostLife();
                    }else{ //ABPRALL-BERECHNUNG
                        if(curPosBall['x'] <= currentPositionStick['x'] + 5*stickLength){ //Befindet sich der Ball auf der linken Hälfte, fliegt er dementsprechend auch nach Links oder umgekehrt.
                            if(curPosBall['x'] <= currentPositionStick['x'] + 1*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                                direction = 1;
                            }else{
                                direction = 0;
                            }
                             ball = "up-left";
                        }else{
                            if(curPosBall['x'] >= currentPositionStick['x'] + 9*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                                direction = 1;
                            }else{
                                direction = 0;
                            }
                            ball = "up-right";
                        }
                    }
               }
           }      
}
function drawStick(){ //Loop in play(), stick wird permanent neu gezeichnet.
    ctx.clearRect(0,currentPositionStick['y'],canvas.width,stickHeight);
    ctx.drawImage(imgStick,currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); 
}
function moveRight(){
    if(currentPositionStick['x'] + 10*stickLength >= canvas.width){ //Kollisionsabfrage, falls Spieler an Rand gerät
        return null;
    }else{
        currentPositionStick['x'] = currentPositionStick['x'] + gridSize; //Erhöhe den X-Wert
        ctx.drawImage(imgStick,currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight);
            if(ball == "" && level != "Käster"){ //Wenn Ball noch nicht gestartet ist, bewegt er sich dem Stick entsprechend
                moveBallAtStart(gridSize);
            }
    }  
}
function moveLeft(){
    if(currentPositionStick['x'] <= 0 ){ //Kollisionsabfrage, falls Spieler an Rand gerät
            return null;
         }else{
            currentPositionStick['x'] = currentPositionStick['x'] - gridSize; //Verringere den X-Wert
            ctx.drawImage(imgStick,currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight);      
                if(ball == "" && level != "Käster"){ //Wenn Ball noch nicht gestartet ist, bewegt er sich dem Stick entsprechend
                    moveBallAtStart(-gridSize);
                }
        }      
}
function moveBallAtStart(a){
    ctx.clearRect(curPosBall['x'] - radius, curPosBall['y'] - radius, 2*radius,2*radius);
        curPosBall['x'] = curPosBall['x'] + a; //Neue Position des Balls
    ctx.drawImage(imgBall,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
}
//-------------------------------- POWER UPS -----------------------------------
speedPowerUp = 20; //Bestimmt Animationsgeschwindigkeit nach unten
PsizeWidth = 35; //Bestimmt Größe der Power Ups
PsizeHeight = 35;

function PowerUp(x,y,ic,st,index){     //Klassendeklaration eines Power-Ups       
    this.move = function(){
        if(y < canvas.height){  
            ctx.clearRect(x,y,PsizeWidth,PsizeHeight); //LÃ¶sche Power-Up
            if(level != "Käster"){
                y+= 1; //Y-Einheiten in welchem das Power-Up sich nach unten bewegt
            }else{
                y = y + 6;
            }
            ctx.drawImage(ic,x,y,PsizeWidth,PsizeHeight); //Zeichne Power-Up
            if(y + PsizeHeight >= currentPositionStick['y'] && x + PsizeHeight >= currentPositionStick['x'] && x <= currentPositionStick['x'] + 10*stickLength){ //Kollisionsabfrage
                ctx.clearRect(x,y,PsizeWidth,PsizeHeight); //LÃ¶sche Power-Up aus Canvas
                clearInterval(powerUp[index]);
                choosePowerUp(st);
            }
        }else{
            clearInterval(powerUp[index]);
        }
    };
}
function newPowerUp(i){  
    if(createPowerUp() && i != "Käster"){ //Zufallswert um ein Power-Up zu erzeugen
        randomPowerUp(); //Generiere ZufÃ¤lliges Power-Up
        NewPowerUp = new PowerUp(blocks[i][0] + gridSizeBlocks,blocks[i][1] + 0.5*gridSizeBlocks,icon,state,indexPowerUp); //Erzeuges neues PowerUp
        powerUp.push(setInterval(NewPowerUp.move,speedPowerUp));   //starte Animations-Loop
        indexPowerUp++; //Erhöhe Index-Zähler
    }
    if(i == "Käster"){ //KÄSTER LEVEL
        state = "käster";
        icon = document.getElementById("laser");
        NewPowerUp = new PowerUp(curPosBall['x'] - laser,curPosBall['y'] ,icon,state,indexPowerUp); //Erzeuges neues PowerUp
        powerUp.push(setInterval(NewPowerUp.move,speedPowerUp));   //starte Animations-Loop
        indexPowerUp++; //Erhöhe Index-Zähler
        NewPowerUp = new PowerUp(curPosBall['x'] + laser,curPosBall['y'] ,icon,state,indexPowerUp); //Erzeuges neues PowerUp
        powerUp.push(setInterval(NewPowerUp.move,speedPowerUp));   //starte Animations-Loop
        indexPowerUp++; //Erhöhe Index-Zähler
    }
}
function randomPowerUp(){
    var r = Math.round(Math.random()*10);
    switch(r){
        case 0:
            state = "smallStick";
            icon = document.getElementById("small");
            break;
        case 1:
            if(10*stickLength < 0.5*canvas.width){ //Verhindert, dass Schläger niemals größer als Canvas selbst sein kann
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
        case 6:
            state = "flip";
            icon = document.getElementById("cartman");
            break;
        case 7:   
            state = "gun";
            icon = document.getElementById("gun");
            break;
        case 8:
            state = "autopilot";
            icon = document.getElementById("autopilot");
            break;
        case 9:
            state = "bomb";
            icon = document.getElementById("bomb");
            break;
    }
}
function choosePowerUp(st){
     switch(st){
        case "smallStick":
           newTextPopUp("I made u small, Darling");
           smallStick(); 
           break;
        case "largeStick":
            if(10*stickLength < 0.6*canvas.width){ //Verhindert, dass Schläger niemals größer als Canvas selbst sein kann
                largeStick();
            }else{
                newTextPopUp("Sorry, but u are too large!");
            }        
           break;
        case "fasterBall":
            fasterBall();
            break;
        case "slowerBall":
            slowerBall();
            break;
        case "powerBall":
                clearInterval(timeoutBomb);
                resetPowerUp("bomb");
            newTextPopUp("PowerBall Activated!");
            powerBall = true;
            imgBall = document.getElementById("fireball");
            clearTimeout(timeoutPowerBall);
            timeoutPowerBall = setTimeout(function(){resetPowerUp("powerBall")},10000); //Reset nach 10 Sek.
            newPowerUpPopUp("fireball",10);
            break;
        case "moreLifes":
            newTextPopUp("Leben +1");
            leben++;
            document.getElementById("lifes").innerHTML = leben;
                indexHeartBeat = 0; //Herzschlag-Animation
                heartbeat =  setInterval(heartBeat,200);           
            break;
        case "flip":
            newTextPopUp("Kurzschluss...");
            flip = true; //Kehrt Steuerung um
            setTimeout(function(){flip=false;},3000); //Resettet Zustand
            newPowerUpPopUp("cartman",3);
            break;
        case "gun":
            newTextPopUp("Let's Rock Dude!");
            shootPossible = true;
            imgStick = document.getElementById("stick-gun");
            clearTimeout(timeout);
            timeout = setTimeout(function(){resetPowerUp("gun");},7000);
            newPowerUpPopUp("gun",7);
            break;
        case "autopilot":
            newTextPopUp("Autopilot: ON");
            clearInterval(intervalAutopilot);
            clearTimeout(timeoutAutopilot);
            intervalAutopilot = setInterval(autopilot,10);
            timeoutAutopilot = setTimeout(function(){resetPowerUp("autopilot");},10000);
            newPowerUpPopUp("autopilot",10);
            break;
        case "bomb":
                clearTimeout(timeoutPowerBall); //PowerBall resetten
                resetPowerUp("powerBall");
            newTextPopUp("Don't touch me...");
            imgBall = document.getElementById("bomb");
            bomb = true;
            clearInterval(timeoutBomb);
            timeoutBomb = setTimeout(function(){resetPowerUp("bomb");},10000);  //Reset IMGBALL + BOMB = FALSE
            newPowerUpPopUp("bomb",10);
            break;
        case "käster":
            kästerFireHitYou();
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
        newTextPopUp("Larger Stick!");
        stickLength *= 1.5;
        ctx.fillStyle = "grey";
        ctx.fillRect(currentPositionStick['x'],currentPositionStick['y'],10*stickLength,stickHeight); //Zeichne neuen Stick
}
//POWER UP: SCHNELLERER BALL
function fasterBall(){
    newTextPopUp("Speed +1");
    gridSizeBall++;
}
//POWER UP: LANGSAMERER BALL
function slowerBall(){
    newTextPopUp("Speed -1");
    if(gridSizeBall > 1){
        gridSizeBall--;
    }
}
//POWER UP:AUTOPILOT
function autopilot(){
    flip = true;
    var x = curPosBall['x'] - 5*stickLength;
        if(x + 10*stickLength >= canvas.width){ //Kollisionsabfrage, falls Spieler an Rand gerät
                //Tue nichts
        }else if(x <= 0){
                //Tue nichts
        }else{
            currentPositionStick['x'] = x;
        }
}
function resetPowerUp(p){
    switch(p){
        case "bomb":
            imgBall = document.getElementById("ball");
            bomb = false;
            break;
        case "gun":
            imgStick = document.getElementById("stick");
            shootPossible = false;
            break;
        case "powerBall":
            powerBall = false;
            imgBall = document.getElementById("ball");
            break;
        case "autopilot":
            clearInterval(intervalAutopilot);
            flip = false;
    }
}

//---------------------- POWER UP: SCHIEßEN ------------------------------------
speedShoot = 5;
function newShoot(index,x,x2,y){  //KLASSEN DEKLARATION FÜR EINEN SCHUSS
    this.startShoot = function(){
        ctx.fillStyle = "grey";
     
        ctx.clearRect(x-1,y,4,10);
        ctx.clearRect(x2-1,y,4,10);

        y = y - speedShoot;

        ctx.fillRect(x,y,2,10);
        ctx.fillRect(x2,y,2,10);
        if(level != "Käster"){
            collisionWithBlocks(index,x,x2,y);
        }else{
            collisionWithKäster(index,x,x2,y);
        }
        if(y+10 < 0){
           clearInterval(intervalShoot[index]);
        }
    };
}
function shoot(){   //START FUNKTION UM EINEN SCHUSS ZU ERZEUGEN
    if(shootPossible){
        shootObj = new newShoot(indexShoot,currentPositionStick['x'] + 0.5*stickLength,currentPositionStick['x'] + 9.5*stickLength,currentPositionStick['y'] - stickHeight);
        intervalShoot.push(setInterval(shootObj.startShoot,30));
        indexShoot++;
    }
}
function collisionWithBlocks(index,xShoot1,xShoot2,yShoot){ //PRÜFT AUF KOLLISION MIT BLÖCKEN
    for(var j = 0; j < blocks.length;j++){
        if(yShoot <= blocks[j][1] + gridSizeBlocks){
             if(xShoot1  >= blocks[j][0] && xShoot1 <= blocks[j][0] + 2*gridSizeBlocks ||
                xShoot2  >= blocks[j][0] && xShoot2 <= blocks[j][0] + 2*gridSizeBlocks){ //block[i][1] = Y-Koordinate
                    ctx.clearRect(blocks[j][0],blocks[j][1],2.3*gridSizeBlocks,1.3*gridSizeBlocks); //Lösche Block + Schatten
                    blocks.splice(j,1);
                    
                    clearInterval(intervalShoot[index]);
                    
                    ctx.clearRect(xShoot1-1,yShoot,4,10);
                    ctx.clearRect(xShoot2-1,yShoot,4,10);
                    
                    updateScore();
                    levelComplete();
            }
        }
    }
}
function collisionWithKäster(index,xShoot1,xShoot2,yShoot){
    if(yShoot <= curPosBall['y'] + radius){
        if(xShoot1 >= curPosBall['x'] - radius && xShoot1 <= curPosBall['x'] + radius ||
           xShoot2 >= curPosBall['x'] - radius && xShoot2 <= curPosBall['x'] + radius){
                clearInterval(intervalShoot[index]);
                ctx.clearRect(xShoot1-1,yShoot,4,10);
                ctx.clearRect(xShoot2-1,yShoot,4,10);
                hitKäster();
        }
    }
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
            if(!flip){
                 moveLeft();
            }else{
                moveRight();
            }
           break;     
        case 38: //Up Key
            startMoveBall();
            break;
        case 39: //Right Key
            if(!flip){
                moveRight();
            }else{
                moveLeft();
            }
            break;   
        case 40: //Down Key
            gridSizeBall++;
            break;
        default:
            break;
   } 
};
//----------------------------- MAUS -------------------------------------------
document.onmousemove = function(evt){
    if(allowPressKeys){
        if(!flip){
            if (!evt) evt = window.event;
            if (evt) var x = -0.5*window.innerWidth + 0.5*canvas.width + evt.clientX - 5*stickLength;
                if(x + 10*stickLength >= canvas.width){ //Kollisionsabfrage, falls Spieler an Rand gerät
                    //Tue nichts
                }else if(x <= 0){
                    //Tue nichts
                }else{
                    currentPositionStick['x'] = x;
                    if(ball == "" && level != "Käster"){ //Falls Ball noch nicht gestartet ist
                        ctx.clearRect(curPosBall['x'] - radius, curPosBall['y'] - radius, 2*radius,2*radius);
                        curPosBall['x'] = x + 5*stickLength; //Neue Position des Balls
                        ctx.drawImage(imgBall,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
                    }
                }
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
    document.getElementById("dev_menu").style.display = "none";
}
function showStartButtons(){
    document.getElementById("play_menu").style.display = "block";
    document.getElementById("pause_menu").style.display = "none";
}
function random(){ //Zufallszahlen-Generator 
    var a = Math.random() * 9;
    return (Math.round(a));
}         
//-------------------- WAHRSCHEINLICHKEIT FÜR POWER UP -------------------------
function createPowerUp(){ //Wahrscheinlichkeit für das Erzeugen eines Power-Ups
    var a = Math.round(Math.random()*1.5);
    if(a == 0){
        return true;
    }else{
        return false;
    }
}
//------------------------------- TEXT - POPUPS --------------------------------
function newTextPopUp(text){
    var pop = new TextPopUp(currentPositionStick['x'] + 5*stickLength, currentPositionStick['y'] - 5,indexTextPopUp);
    textPopUp.push(setInterval(function(){pop.move(text);},50));
    indexTextPopUp++;
}
function TextPopUp(x,y,index){
    this.x = x;
    this.y = y;
    this.fade = 1.0;
    
    this.move = function(text){
        ctx.fillStyle = "rgba(255,0,0,"+this.fade+")"; 
        ctx.font="15px Arial";
        ctx.clearRect(this.x,this.y - 15,200,20);
        ctx.fillText(text,this.x,this.y);
        this.y = this.y - 1;
        this.fade = this.fade - 0.03;
        if(this.y < 350){
            clearInterval(textPopUp[index]);
            ctx.clearRect(this.x,this.y - 15,200,20);
        }
    };
}
function heartBeat(){ //Herzschlag Animation nach Leben +1
    var t = document.getElementById("heart2");
    var size = ["31px","32px","33px","34px","35px","34px","33px","32px","31px","30px","31px","32px","33px","34px","35px","34px","33px","32px","31px","30px"];     
    t.style.width = size[indexHeartBeat++];
    t.style.height = size[indexHeartBeat++];
    if(indexHeartBeat == size.length){
        clearInterval(heartbeat);
    }   
}
//---------------------- CANVAS 2 - PowerUp - TIMER ----------------------------
function newPowerUpPopUp(icon,timer){
    for(var i=0;i<PowerUpPopUpInterval.length;i++){ //Überprüfe ob ein PopUp der gleichen Art schon aktiv ist. Falls ja setze Zeit neu 
        if(icon == PowerUpPopUpInterval[i].PowerUp){
            PowerUpPopUpInterval[i].zahl = timer;
            PowerUpPopUpInterval[i].fade = 1.0;
            return null;
        }
    }
    switch(positionPowerUpPopUp){ //Positionen der PopUps
        case 0:
            var imgy = canvas2.height*0.05 - 2;
            var y = canvas2.height*0.2;
            break;
        case 1:
            var imgy = canvas2.height*0.3 - 2;
            var y = canvas2.height*0.45;
            break;
        case 2:
            var imgy = canvas2.height*0.55 - 2;
            var y = canvas2.height*0.7;
            break;
        case 3:
            var imgy = canvas2.height*0.8 - 2;
            var y = canvas2.height*0.95;
            break; 
    }
    var imgx = canvas2.width*0.25; //X-Positionen immer gleich
    var x = canvas2.width*0.5;
    PowerUpPopUpInterval[positionPowerUpPopUp] = new PowerUpPopUp(icon,imgx,imgy,x,y,positionPowerUpPopUp,timer); //Erzeuge neues PopUp
    PowerUpPopUpInterval[positionPowerUpPopUp].count(); //Rufe Timer Funktion auf
    positionPowerUpPopUp++; //Erhöhe die Position um 1 (wird immer wieder verringert, wenn ein PopUp ausläuft)
}
function PowerUpPopUp(icon,imgx,imgy,x,y,index,zahl){
    this.PowerUp = icon;
    this.img = document.getElementById(icon);
    this.imgx = imgx;
    this.imgy = imgy;
    this.x = x;
    this.y = y;
    this.fade = 1.0;
    this.zahl = zahl;
       
    this.count = function(){
        ctx2.drawImage(this.img,this.imgx,this.imgy,20,20);
        ctx2.font="20px Arial";
        ctx2.fillStyle = "rgba(255,255,255,"+this.fade+")";
        if(this.zahl < 3.2){ //Farbe auf "Rot" ändern
            ctx2.fillStyle = "rgba(255,0,0,"+this.fade+")";
            if(this.zahl < 2){ //Langsam Ausblenden
                this.fade = this.fade - 0.05;
            }
        }
        if(this.zahl > 0.1){
            this.zahl -= 0.1;
            ctx2.clearRect(this.x,this.y-20,canvas2.width,25); //Text löschen
            ctx2.fillText(this.zahl.toFixed(1),this.x,this.y); //Text zeichnen
            setTimeout(function(){PowerUpPopUpInterval[index].count();},100); //Funktion wieder aufrufen
        }else{
            this.PowerUp = ""; //Resette Zustand (Falls das PowerUp schon läuft, setze einfach Zahl wieder auf Startzeit)
            ctx2.clearRect(0,this.y-20,canvas2.width,25);
            if(PowerUpPopUpInterval[index] != PowerUpPopUpInterval[positionPowerUpPopUp-1]){
                this.changePosition();
            }else{
                positionPowerUpPopUp--; //Position neu freimachen
                if(level == "Käster"){
                    alert("You Suck, time is over!");
                     shootPossible = false;
                    pause();
                    showStartButtons(); 
                    setTimeout(KästerWon,2000);
                }
            }
        }
    };
    
     this.changePosition = function(){
         if(PowerUpPopUpInterval[index] != PowerUpPopUpInterval[positionPowerUpPopUp-1]){ //Letztes PopUp?
             if(this.zahl < 0.1){ //Falls PopUp schon beendet wurde
                this.zahl = PowerUpPopUpInterval[index+1].zahl;
                this.img = PowerUpPopUpInterval[index+1].img;
                this.fade = PowerUpPopUpInterval[index+1].fade;
                this.PowerUp = PowerUpPopUpInterval[index+1].PowerUp;
                this.count();
             }else{ //Falls PopUp noch läuft
                this.zahl = PowerUpPopUpInterval[index+1].zahl;
                this.img = PowerUpPopUpInterval[index+1].img;
                this.fade = PowerUpPopUpInterval[index+1].fade;
                this.PowerUp = PowerUpPopUpInterval[index+1].PowerUp;
             } 
            ctx2.clearRect(0,PowerUpPopUpInterval[index+1].y-20,canvas2.width,25);

            PowerUpPopUpInterval[index+1].changePosition(); //Rufe selbes für nachfolgendes PopUp auf
         }else{
            this.zahl = 0; //Setzte Timer der letzten Zahl auf 0 (wird somit gelöscht in count();
         }
    };    
 }
 function clearCanvas2(){ //Lösche komplettes Canvas2 + PowerUp Array
     for(var i=0;i<PowerUpPopUpInterval.length;i++){
        ctx2.clearRect(0,PowerUpPopUpInterval[i].y-20,canvas2.width,25);
        PowerUpPopUpInterval[i].zahl = 0;
    }
    PowerUpPopUpInterval = [];
    positionPowerUpPopUp = 0;
 }
//------------------------------- HEADLINE -------------------------------------
function startCrazyText(){ //Aktiv bei Hover über Headline
    textHead = setInterval(atariBreakout,30);    
}
function stopCrazyText(){
    clearInterval(textHead);
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
//------------------------------- Version --------------------------------------
function startAnimate(){
    countText = 0;
    indexVersion = 0;
    setInterval(animate,60);
}
function animate(){
    var t = document.getElementById("version");
    var size = ["1.22em","1.24em","1.26em","1.28em","1.3em","1.32em","1.34em","1.36em","1.38em","1.4em"];      
    if(countText == 0){
        t.style.fontSize = size[indexVersion++];
        if(indexVersion == size.length-1){
            countText = 1;
        }
    }else{
        t.style.fontSize = size[indexVersion--];
        if(indexVersion == 0){
            countText = 0;
        }
    }      
}
//---------------------------- KÄSTER BALL ------------------------------------
function kästerBall(){
    document.getElementById("canvas").style.backgroundImage = "url(kästerLevel/kästerBackground.png)";
    document.getElementById("headline").innerHTML = "KÄSTER BALL";
    radius = 50;
    imgBall = document.getElementById("kästerBall");
    shootPossible = true;
    imgStick = document.getElementById("stick-gun");
    currentPositionStick['y'] = 380;
    curPosBall['y'] = 60;
    leben = 3;
    speedShoot = 10;
    PsizeWidth = 4; //Bestimmt Größe der Power Ups
    PsizeHeight = 20;
    speedPowerUp = 10; //Bestimmt Animationsgeschwindigkeit nach unten
    document.getElementById("lifes").innerHTML = leben;
}
function hitKäster(){//Wird bei Treffer von Käster ausgelöst
    ctx.clearRect(curPosBall['x'] - radius, curPosBall['y'] - radius, 2*radius,2*radius); // Lösche BALL
    radius = radius - 1;
    if(radius % 5 == 0){
        laser--;
        PsizeHeight--;
        if(radius % 20 == 0){
            PsizeHeight--;
            PsizeWidth--;
        }
        gridSizeBall++;
        speedFireKäster = speedFireKäster - 200;
        curPosBall['y'] = curPosBall['y'] - 5;
    }
    imgBall = document.getElementById("kästerBallTot");
   
    setTimeout(function(){imgBall = document.getElementById("kästerBall");},200);
    ctx.fillStyle = "red";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    setTimeout(function(){ctx.clearRect(0,0,canvas.width,canvas.height);},20);
    var score = parseInt(document.getElementById("score").innerHTML); 
    document.getElementById("score").innerHTML = score + 100;
    if(radius <= 3){
        alert("Congratulation!\nYou defeated Käster!");
        shootPossible = false;
        pause();
        showStartButtons();
        setTimeout(defeatedKäster,2000);
    }    
}
function moveKäster(){ //Berechnet die Bewegung von Käster!
    var random = Math.random()*50;
    if(random < 1){
        if(ball == "right"){
            ball = "left";
        }else{
            ball = "right";
        }
    }
        switch(ball){
          case "right":
              curPosBall['x'] = curPosBall['x'] + gridSizeBall;
              break;
          case "left":
              curPosBall['x'] = curPosBall['x'] - gridSizeBall;
              break;        
        }
}
function hitBorderKäster(){
    if(curPosBall['x'] - radius <= 0){
        ball = "right";
    }else if(curPosBall['x'] + radius >= canvas.width){
        ball = "left";
    }
}
function kästerFire(){
    newPowerUp("Käster");
    timeoutFire = setTimeout(kästerFire,speedFireKäster);
}
function kästerFireHitYou(){
    leben = leben - 0.5;
    if(leben == 0){
        alert("Käster defeated YOU");
         shootPossible = false;
        pause();
        showStartButtons(); 
        setTimeout(KästerWon,2000);
    }
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    setTimeout(function(){ctx.clearRect(0,0,canvas.width,canvas.height);},20);
    document.getElementById("lifes").innerHTML = leben;
    newTextPopUp("Leben -1");  
}
function defeatedKäster(){
    ctx.drawImage(document.getElementById("kästerBallTot"),180,0,400,400);
}
function KästerWon(){
        ctx.drawImage(document.getElementById("kästerWon"),180,0,400,400);
        trololo();
}