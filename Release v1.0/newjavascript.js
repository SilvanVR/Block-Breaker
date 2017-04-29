function checkSupported(){
    canvas = document.getElementById("canvas");
    canvas2 = document.getElementById("canvas2");
    if(canvas.getContext){
        ctx = canvas.getContext("2d");  
        ctx2 = canvas2.getContext("2d");
        document.getElementById("canvas").style.backgroundImage = "url(background/green.png)";
        level = 1;
    }else{
        alert("Sorry bro, but your Browser is shit, try another one!");
    }
}
// ------------------ MAIN FUNCTION ------------------
color = ["green","red","blue","yellow","orange","violet","lightblue"]; //Farben Array
allowPressKeys = false;

function startGame(länge,höhe,blockSize,radiusBall,startY,GridSize,Leben,Difficulty){
   ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
   document.getElementById("score").innerHTML = 0; //Score-Tafel auf 0 setzen
   
   blocks = []; //Array in welchem die Koordinaten der Blöcke gespeichert werden

   DirectionBall = ""; //Startrichtung des Balls
   SteigungBall = 0; //Bestimmt die Steigung des Balles (0: 45°, 1: 22,5°)
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
   imgBall2 = document.getElementById("ball2"); //Aussehen duplizierter Bälle
   powerBall = false; //Bestimmt ob powerBall aktiv ist (keine Kollision mit blöcken)
   intervalBall = []; //Für extrem hohe Geschwindigkeiten sind mehrere Intervalle eines Balles nötig
   indexBall = 0; //Zählt Anzahl Bälle mit
   balls = []; //Speichert Bälle als Objekte
   
   gridSizeBlocks = blockSize; //Größe der Blöcke

   PowerUps = []; //Speicher PowerUp als Objekt
   indexPowerUp = 0; //Zählt Menge der Power Ups
   state = ""; //Speichert Zustand d. Power Ups
     
   shootPossible = false; //Schießen nicht möglich
   shoots = []; //Speichert einen Schuss als Objekt
   indexShoot = 0;
   timeoutShootAllowed = "";
   
   flip = false; //Kehre Steuerung um
   timeout = ""; //Initialisieren, timeout fürs Schießen
   timeoutPowerBall = ""; //Initialisieren, timeout für PowerBall
   
   intervalAutopilot = ""; //Intervall des Autopilots
   timeoutAutopilot = ""; //Variable um timeout zu resetten (bei wiederholter Aufnahme d. Power Ups)
   
   timeoutBomb = ""; //Timeout zum Reset für PowerUp-Bomb
   bomb = false; //Bestimmt ob aktiv oder nicht
      
   positionTimer = 0; //speichert Position des Pop-Ups
   timerInterval = []; //Array der Pop-Ups in Canvas 2
   
   IntervalFinalTimer = "";//Intervall des Timers im Endlevel
   finalTimer = 0.1; //Timer Anfangswert
   fontSize = 20; //Timer Font-Größe Anfangs
   
   difficulty = Difficulty;
   //----Kästerlevel----
   kästerfire = true;
   timeoutFire = "";
   speedFireKäster = 2000;
   laser = 10;
   KästerLeben = 50;
   //--- SOUND -----
   sound = "";
   
   drawLevel();
   play(); //Starte Game-Loop
}
//------------------------------ GAME OPTIONS ----------------------------------
function play(){ //Game-Loop
  ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
  interval = setInterval(drawStick,20);
  intervalBlocks = setInterval(redrawBlocks,100);
  if(DirectionBall != "") for(var i = 0; i < intervalBall.length;i++) intervalBall[i] = (setInterval(drawBall,speed)); //Nimmt den Loop des Balls wieder auf    
  if(timeoutFire != "") timeoutFire = setTimeout(kästerFire,speedFireKäster);
  if(DirectionBall != "" && level == 4) IntervalFinalTimer = setInterval(FinalTimer,100); 
  for(var j = 0;j<balls.length;j++) balls[j].startInterval();
  for(var k = 0;k<PowerUps.length;k++) PowerUps[k].startInterval();
  drawStartBall(); //Zeichne Startball  
  sound.play();  
  document.getElementById("pirates").pause();
  allowPressKeys = true;   
}
function pause(){ //Cleared alle Intervalle
  clearInterval(interval);
  clearInterval(intervalBlocks);
  clearInterval(IntervalFinalTimer);
  for(var i = 0; i < intervalBall.length;i++) clearInterval(intervalBall[i]);
  for(var k = 0;k<PowerUps.length;k++) PowerUps[k].stop();
  for(var z = 0;z<shoots.length;z++) shoots[z].stop(); 
  for(var j = 0;j<balls.length;j++) clearInterval(balls[j].interval);
  clearTimeout(timeoutFire);
  clearCanvas2();
  sound.pause();
  if(level != "Käster")document.getElementById("pirates").play();
  allowPressKeys = false;
}
function startMoveBall(){
    if(DirectionBall == "" && level != "Käster"){ //Startet Game-Loop des Balls, wenn Ball noch nicht in Bewegung ist
        DirectionBall = "up-left";
        intervalBall[0] = setInterval(drawBall,speed);
        if(level != "Last") document.getElementById("pause_menu").style.display = "block";     
        if(level == 4) {IntervalFinalTimer = setInterval(FinalTimer,100); document.getElementById("pause_menu").style.display = "none";}
    }
    if(shootPossible)shoot();
    
    if(level == "Käster" && kästerfire){
        if(difficulty == "veryEasy") newTimer("kästerBall",99);
        if(difficulty == "Easy") newTimer("kästerBall",50);
        if(difficulty == "Normal") newTimer("kästerBall",30);
        if(difficulty == "Hard") newTimer("kästerBall",20);
        if(difficulty == "Insane") newTimer("kästerBall",10);
        DirectionBall = "right";
        intervalBall[0] = setInterval(drawBall,speed);
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
    pause();
    if(level != 4){
        level++;
        alert("Nice Dude! Level Complete!\nTry the next Level!");
    }else{
        level = "Käster"; //level auf Käster setzen
        alert("You are Ready to fight against Käster...\n Good Luck, you will need it!");
    }
    resetPowerUp("autopilot");
    
    if(difficulty == "veryEasy")startGame(60,10,20,10,385,20,leben,"veryEasy"), buttonStart();
    else if(difficulty == "Easy") startGame(32,10,20,10,385,20,leben,"Easy"), buttonStart();
    else if(difficulty == "Normal") startGame(8,10,20,7,385,20,leben,"Normal"), buttonStart();
    else if(difficulty == "Hard") startGame(2,2,10,3,393,20,leben,"Hard"), buttonStart();
    else if(difficulty == "Insane") startGame(1,2,8,2,395,10,leben,"Insane"),buttonStart();
}
function lostLife(){
    if(leben != 1){
         pause();
         ctx.clearRect(0,0,canvas.width,canvas.height); //Lösche komplettes Canvas
         currentPositionStick['x'] = 200; //Position des Sticks neu bestimmen
         DirectionBall = ""; //Movement resetten
         SteigungBall = 0; //Steigung resetten
         resetPowerUp("autopilot");
         resetPowerUp("powerBall");
         resetPowerUp("bomb"); 
         resetPowerUp("gun");
         resetPowerUp("balls");
         resetPowerUp("PowerUps");
         clearCanvas2();
         if(level != "Käster" && level != 4) gridSizeBall = 3; //Speed resetten    
         if(level == 4)resetLevel4();
         curPosBall = {'x': (currentPositionStick['x'] + 5*stickLength) , 'y': (currentPositionStick['y'] - radius - 1)}; //Position des Balles neu bestimmen
         document.getElementById("lifes").innerHTML = --leben; //Leben abziehen
         play(); //Game Loop und zeichnen
    }else{
        sound.pause();
        level = 1;
        newSoundEffect("gameover");        
        score(); //Punkte anschauen und alert Nachricht ausgeben  
        pause(); //Spiel anhalten 
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
    resetKästerLevel();    
    switch(level){
        case 1:
            drawLevel1();
            document.getElementById("canvas").style.backgroundImage = "url(background/green.png)";
            document.getElementById("headline").innerHTML = "Block Breaker";
            sound = document.getElementById("soundLevel1");
            sound.play();
            break;
        case 2: 
            drawLevel2();
            document.getElementById("canvas").style.backgroundImage = "url(background/bird.jpg)";
            document.getElementById("headline").innerHTML = "Block Breaker";
            sound = document.getElementById("soundLevel2");
            sound.play();
            break;
        case 3:
            drawLevel3();
            document.getElementById("canvas").style.backgroundImage = "url(background/level3.jpg)";
            document.getElementById("headline").innerHTML = "Block Breaker";
            sound = document.getElementById("soundLevel3");
            sound.play();
            break;
        case 4:
            startFinalLevel();
            level = 4;
            document.getElementById("canvas").style.backgroundImage = "url(background/level4.jpg)";
            document.getElementById("headline").innerHTML = "Block Breaker";
            sound = document.getElementById("finalLevel");
            sound.play();
            break;
        case "Käster":
            sound = document.getElementById("soundLevelKäster");
            kästerBall();        
            break;
    }
    sound.currentTime = 0;
    if(level != 4) document.getElementById("level").innerHTML = level;
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
function startFinalLevel(){ //Main Funktion für Level 4 (final)
    gridSizeBall = 2;
    textPlace = 30;
    stickLength = 10;
    fillStyleText = "White";
    question = 0;
    CorrectAnswer = 0;
    answerpossible = false;
    timeoutQuestion = "";
    document.getElementById("lifes").innerHTML = leben; 
    document.getElementById("level").innerHTML = "Last";
}
function FinalTimer(){ //Timer, der immer größer werdend in der Mitte des Canvas gezeichnet wird
    ctx.font = ""+fontSize+"px Arial";
    ctx.fillStyle = fillStyleText;
    finalTimer += 0.1;
    var t = finalTimer.toFixed(1);  
    if(t == 0.2) newTextPopUp("Survive as long as you can...");
    if(t == 5) newTextPopUp("Reach 200s to defeat Käster!");
    if(t > 10){
        var x = canvas.width/2 - textPlace;  
        ctx.clearRect(x-10,canvas.height*0.6-fontSize,fontSize*3,fontSize+10);
        ctx.fillText(t,x,canvas.height*0.6);
        if(t % 1 == 0) textPlace++;
        if(t % 1 == 0) fontSize++;
        if(t == 100) textPlace += 10;
        if(t % 10 == 0){
            fillStyleText = "Red";
            textAnimation(12);
            setTimeout(function(){fillStyleText = "White"},600);
        } 
    }  
    document.getElementById("score").innerHTML = t; 
    if(t == 10) newQuestion("Wer ist der momentane Bundeskanzler von Deutschland?","Angelo Merte","Adolf Hitler","Angela Merkel"), CorrectAnswer = 3;
    if(t == 25) newQuestion("Berechnen sie folgendes: 5 + 5 * 10:","100","45","55"), CorrectAnswer = 3;
    if(t == 40) newQuestion("Ich bin überall, doch niemand sieht mich, aber jeder brauch mich. Was bin ich?","Wasser","Das Schicksal","Gott","Luft"), CorrectAnswer = 4;
    if(t == 55) newQuestion("Gummibären, sie hüpfen...","dort und hier und überall","hier und dort und nirgendswo","hier und dort und überall","hier und dort und nirgendswo"), CorrectAnswer = 3;  
    if(t == 70) newQuestion("Was gibt es wirklich?","Bob - Cola","Suck - Frikadellen","Retard - Tabletten","Noob - Burger"), CorrectAnswer = 3;
    if(t == 85) newQuestion("Rechnen Sie: 6 * 6 + 4 / 2 - 4 * 5","22","18","0","4","10"), CorrectAnswer = 2;
    if(t == 100) newQuestion("Was ist Anatidaephobie?","Die Angst vor Spinnen","Die Angst vor Enten","Die Angst vor der Angst","Die Angst von einer Ente beobachtet zu werden","Die Angst vor Allem"), CorrectAnswer = 4;    
    if(t == 115) newQuestion("Was ist 'falsch'?","Die Wahrheit","Die Lüge","Eine Tat, welche gesellschaftskritisch angesehen wird","Nichts","Ein Wort"), CorrectAnswer = 5;    
    if(t == 130) newQuestion("Was stimmt nicht?","Dieses Spiel ist in JavaScript geschrieben","Es gibt eine Banane - to Go","Um 1900 gab es hauptberuflich auch Kunstfurzer","Mit der Menge an Nahrung die derzeit produziert wird, könnte man die ganze Welt ernähren","Der Slenderman existierte wirklich"), CorrectAnswer = 5;
    if(t == 145) newQuestion("Was ist der Sinn des Lebens?","42","Spaß","Fortpflanzung","Nichts","mhh...Spaghetti?"), CorrectAnswer = 1;
    if(t == 160) newQuestion("Was wollen Pinky und der Brain jede Nacht erreichen?","Den Käse stehlen","Die Weltherrschaft an sich reißen","Die Nacht zum Tag machen","Aus dem Käfig ausbrechen","In ferne Galaxien reisen"), CorrectAnswer = 2;
    if(t == 175) newQuestion("Wie lässt man ein Fohlen zum Pferd heran wachsen (in Minecraft)?","mit Knochenmehl bestreuen","mit Heu füttern","weg sperren und jede Nacht schlagen","einen goldenen Apfel füttern","Das Fohlen töteten und ein neues bei einem Dorfbewohner kaufen"), CorrectAnswer = 4;
    if(t == 190) newQuestion("Nah dran! Nur noch 10 Sekunden bis du auf Käster triffst!"),CorrectAnswer = 0;
    if(t == 200) {
        resetLevel4();
        levelComplete();
        return;
    }
}
function resetLevel4(){
    clearTimeout(timeoutQuestion);
    question = 0;
    answerpossible = false;
    for(var i = 1;i<6;i++){
        $("#answer"+i+"").text("");
        $("#answer"+i+"").fadeIn();
        $("#answer"+i+"").css({"color":"White"});
    }     
    $("#answers").slideUp();
    $("#question").fadeOut(); 
    finalTimer = 0.1; 
    sound.currentTime = 0; 
    fontSize = 20; 
    textPlace = 30;
    document.getElementById("score").innerHTML = 0; 
}
//------------------------------------------------------------------------------
function redrawBlocks(){ //Draw Loop der Blöcke
    for(var i=0;i<blocks.length;i++){
        drawShadowBlocks(blocks[i][0],blocks[i][1]);
        ctx.fillStyle = colorBlocks; 
        ctx.fillRect(blocks[i][0],blocks[i][1],2*gridSizeBlocks,gridSizeBlocks); //zeichne Blöcke, Breite doppelt so groß wie Höhe
    }
}
function hitBlocks(x,y){ //Überprüft ob die 4 Pixel (CurPosBall['x'] +- radius UND CurPosBall['y'] +- radius) ZWISCHEN den Rändern also im Block selbst liegt. 
    for(var i = 0; i < blocks.length;i++){
        if(x + radius >= blocks[i][0] && x + radius <= blocks[i][0] + 2*gridSizeBlocks || //block[i][0] = X-Koordinate
           x - radius >= blocks[i][0] && x - radius <= blocks[i][0] + 2*gridSizeBlocks){ //block[i][1] = Y-Koordinate
            if(y + radius >= blocks[i][1] && y + radius <= blocks[i][1] + gridSizeBlocks || 
               y - radius >= blocks[i][1] && y - radius <= blocks[i][1] + gridSizeBlocks){
                DirectionBall = whichWayToGo(i,DirectionBall,curPosBall['y']); //Kollisionsrichtung
                newPowerUp(i); //Erzeuge zufälliges PowerUp mit einer bestimmten Wahrscheinlichkeit -- festgelegt in createPowerUp() --
                removeBlock(i); //Entferne Block aus Array und von Canvas
                updateScore(); //Aktualisiere Punktestand
                if(blocks.length == 0){
                    levelComplete();
                    return;
                } //Spiel gewonnen?
            }
        }
    }
}
function removeBlock(i){ //Entfernt Block aus Canvas und Array
    ctx.clearRect(blocks[i][0],blocks[i][1],2.3*gridSizeBlocks,1.3*gridSizeBlocks); //Lösche Block + Schatten
    blocks.splice(i,1);   
}
function whichWayToGo(i,ball,y){ //Kollisionsabfrage mit den Blöcken
    if(!powerBall){
        if(ball == "up-right"){ //Kollision UNTEN oder LINKS
            if(y >= blocks[i][1] + gridSizeBlocks ){ //Y-Wert des Balls größer als unterster Pixel des Blocks?
                return "down-right"; //Ball trifft untere Seite
            }else{
                return "up-left"; //Ball trifft Linke Seite
            }
        }else if(ball == "up-left"){ //Kollision UNTEN oder RECHTS
            if(y >= blocks[i][1]+ gridSizeBlocks){ //Y-Wert des Balls größer als unterster Pixel des Blocks?
                return "down-left"; //Ball trifft untere Seite
            }else{
                return "up-right"; //Ball trifft rechte Seite
            }   
        }else if(ball == "down-left"){ //Kollision OBEN oder RECHTS
            if(y >= blocks[i][1]){ //Y-Wert des Balls größer als oberster Pixel-Wert des Blocks?
                 return "down-right"; //Ball trifft rechte Seite
            }else{
                 return "up-left"; //Ball trifft Obere Seite
            }   
        }else if(ball == "down-right"){ //Kollision OBEN oder LINKS
            if(y >= blocks[i][1]){ //Y-Wert des Balls größer als oberster Pixel-Wert des Blocks?
                return "down-left"; //Ball trifft Linke Seite
            }else{
                return "up-right"; //Ball trifft Obere Seite
            }
        }
    }else{
        return ball;
    }
}
// ----------------------------- BALL -------------------------------------
function newBall(x,y){ //Objekt Definition eines neuen Balls
    var ArrayDirection = ["up-left","up-right","down-left","down-right"];
    this.ball = ArrayDirection[Math.round(Math.random()*3)];

    this.x = x;
    this.y = y;
    this.xAlpha = xAlpha;
    this.yAlpha = yAlpha;
    this.steigung = Math.round(Math.random()*3);
    this.interval = "";
    
    var that = this;

while(this.ball == DirectionBall && this.steigung == SteigungBall){ //Verhindert, dass neue Bälle niemals wie der Echte Ball fliegen
    this.ball = ArrayDirection[Math.round(Math.random()*3)];
    this.steigung = Math.round(Math.random()*3);
}
    this.startInterval = function(){
        this.interval = setInterval(function(){that.move();},20);
    };
    
    this.move = function(){ //Game Loop
        ctx.clearRect(this.x - radius, this.y - radius, 2*radius,2*radius); // Lösche BALL
        this.hitStick(); //Überprüfe auf Kollision mit Spieler     
        this.ballDirect(); //Regele die Richtung des Balles und ändere die aktuellen X- und Y- Koordinaten
        ctx.drawImage(imgBall2,this.x - radius,this.y - radius,2*radius,2*radius);
        this.hitBorders(); //Überprüfe auf Kollision mit Wand
        this.hitBlocks(); //Überprüfe auf Kollision mit Blöcken
    };
    
    this.ballDirect = function(){
        switch(this.steigung){
            case 0: //45°
                this.xAlpha = 1;
                this.yAlpha = 1;
                break;
            case 1: //30°
                this.xAlpha = 1.5;
                this.yAlpha = 0.75;
                break;
            case 2: //60°
                this.xAlpha = 0.5;
                this.yAlpha = 1.25;
                break;
            case 3: //15°
                this.xAlpha = 1.75;
                this.yAlpha = 0.5;
                break;
        }
        switch(this.ball){
          case "up-right":
              this.x = this.x + this.xAlpha*gridSizeBall;
              this.y = this.y - this.yAlpha*gridSizeBall;
              break;
          case "down-right":
              this.x = this.x + this.xAlpha*gridSizeBall;
              this.y = this.y + this.yAlpha*gridSizeBall;
              break;
          case "down-left":
              this.x = this.x - this.xAlpha*gridSizeBall;
              this.y = this.y + this.yAlpha*gridSizeBall;
              break;
          case "up-left":
              this.x = this.x - this.xAlpha*gridSizeBall;
              this.y = this.y - this.yAlpha*gridSizeBall;
              break;         
        }
    };  
    
    this.hitBorders = function (){ //Kollisionsabfrage des Balls mit den Rändern des Canvas Elements.
        if(this.y <= radius){ //Oberer Rand
            if(this.ball == "up-right"){
                 this.ball = "down-right";
             }else{
                 this.ball = "down-left";
             }
        }else if(this.x >= canvas.width - radius){ //Rechter Rand
            if(this.ball == "down-right"){
                 this.ball = "down-left";
             }else{
                 this.ball = "up-left";
             }
        }else if(this.y >= canvas.height - radius){ //Unterer Rand
            if(bomb){ //POWERUP : BOMBE --> prallt vom Boden ab
                if(this.ball == "down-right"){
                    this.ball = "up-right";
                }else{
                    this.ball = "up-left";
                }
            }else{
                 clearInterval(this.interval);   
                 ctx.clearRect(this.x - radius, this.y - radius, 2*radius,2*radius); // Lösche BALL
            }
        }else if(this.x <= radius){ //Linker Rand
            if(this.ball == "down-left"){
                this.ball = "down-right";
            }else{
                this.ball = "up-right";
            }
        }    
    };
    
    this.hitStick = function(){
            if(this.y + radius >= currentPositionStick['y']){ //Unterster Punkt des Balls größer/gleich der Höhe des oberen Randes des Sticks?
               if(this.x + radius >= currentPositionStick['x'] && this.x + radius <= currentPositionStick['x'] + 10*stickLength || //Ball (Also die Pixel des X-Wertes +- Radius) Zwischen den X-Werten des Randes des Sticks?
                  this.x - radius >= currentPositionStick['x'] && this.x - radius <= currentPositionStick['x'] + 10*stickLength){
                        if(this.x <= currentPositionStick['x'] + 5*stickLength){ //trifft LINKE HÄLFTE.
                            if(this.x <= currentPositionStick['x'] + 1*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                                this.steigung = 3; //15°
                            }else if(this.x <= currentPositionStick['x'] + 2*stickLength && this.x >= currentPositionStick['x'] + 1*stickLength){
                                this.steigung = 1; //30°
                            }else if(this.x >= currentPositionStick['x'] + 4*stickLength){
                                this.steigung = 2; //60°
                            }else{
                                this.steigung = 0;
                            }
                             this.ball = "up-left";
                        }else{
                            if(this.x >= currentPositionStick['x'] + 9*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                                this.steigung = 3;
                            }else if(this.x >= currentPositionStick['x'] + 8*stickLength && this.x <= currentPositionStick['x'] + 9*stickLength){
                                this.steigung = 1;
                            }else if(this.x <= currentPositionStick['x'] + 6*stickLength){
                                this.steigung = 2;
                            }else{
                                this.steigung = 0;
                            }
                            this.ball = "up-right";                       
                    }
               }
           }      
    };
    
    this.hitBlocks = function(){ 
        for(var i = 0; i < blocks.length;i++){
            if(this.x + radius >= blocks[i][0] && this.x + radius <= blocks[i][0] + 2*gridSizeBlocks || //block[i][0] = X-Koordinate
               this.x - radius >= blocks[i][0] && this.x - radius <= blocks[i][0] + 2*gridSizeBlocks){ //block[i][1] = Y-Koordinate
                if(this.y + radius >= blocks[i][1] && this.y + radius <= blocks[i][1] + gridSizeBlocks || 
                   this.y - radius >= blocks[i][1] && this.y - radius <= blocks[i][1] + gridSizeBlocks){
                    this.ball = whichWayToGo(i,this.ball,this.x); //Kollisionsrichtung
                    newPowerUp(i); //Erzeuge zufälliges PowerUp mit einer bestimmten Wahrscheinlichkeit -- festgelegt in createPowerUp() --
                    removeBlock(i); //Entferne Block aus Array und von Canvas
                    updateScore(); //Aktualisiere Punktestand
                    if(blocks.length == 0){
                        levelComplete();
                        return;
                    } //Spiel gewonnen?
                }
            }
        }
    };
}
function drawStartBall(){
    ctx.drawImage(imgBall,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
}
function drawBall(){ //Wird wiederholt in play() aufgerufen  
    ctx.clearRect(curPosBall['x'] - radius, curPosBall['y'] - radius, 2*radius,2*radius); // Lösche BALL
       
    if(level != "Käster"){
        hitBorderBall(curPosBall['x'],curPosBall['y']); //Überprüfe auf Kollision mit Wand
        hitStick(curPosBall['x'],curPosBall['y']); //Überprüfe auf Kollision mit Spieler     
        hitBlocks(curPosBall['x'],curPosBall['y']); //Überprüfe auf Kollision mit Blöcken
        ballDirection(); //Regele die Richtung des Balles und ändere die aktuellen X- und Y- Koordinaten
    }else{
        moveKäster(); //Bewege KästerBall nach Links/Rechts
        hitBorderKäster(); //Kollisionsüberprüfung mit Rand
    }
       
    ctx.drawImage(imgBall,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
}
function ballDirection(){ //Berechnet die Bewegung des Balls in die jeweilige Richtung
    switch(SteigungBall){
        case 0: //45°
            xAlpha = 1;
            yAlpha = 1;
            break;
        case 1: //30°
            xAlpha = 1.5;
            yAlpha = 0.75;
            break;
        case 2: //60°
            xAlpha = 0.5;
            yAlpha = 1.25;
            break;
        case 3: //15°
            xAlpha = 1.75;
            yAlpha = 0.5;
            break;
    }
        switch(DirectionBall){
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
function hitBorderBall(x,y){ //Kollisionsabfrage des Balls mit den Rändern des Canvas Elements.
    if(y <= radius){ //Oberer Rand
        if(DirectionBall == "up-right"){
             DirectionBall = "down-right";
         }else{
             DirectionBall = "down-left";
         }
    }else if(x >= canvas.width - radius){ //Rechter Rand
        if(DirectionBall == "down-right"){
             DirectionBall = "down-left";
         }else{
             DirectionBall = "up-left";
         }
    }else if(y >= canvas.height - radius){ //Unterer Rand
        if(bomb){ //POWERUP : BOMBE --> prallt vom Boden ab
            if(DirectionBall == "down-right"){
                DirectionBall = "up-right";
            }else{
                DirectionBall = "up-left";
            }
        }else{
            lostLife(); //Leben verlieren
        }
    }else if(x <= radius){ //Linker Rand
        if(DirectionBall == "down-left"){
            DirectionBall = "down-right";
        }else{
            DirectionBall = "up-right";
        }
    }    
}
//---------------------------------- Stick -------------------------------------
function hitStick(x,y){  //Kollisionsabfrage mit Ball
       if(y + radius >= currentPositionStick['y']){ //Unterster Punkt des Balls größer/gleich der Höhe des oberen Randes des Sticks?
               if(x + radius >= currentPositionStick['x'] && x + radius <= currentPositionStick['x'] + 10*stickLength || //Ball (Also die Pixel des X-Wertes +- Radius) Zwischen den X-Werten des Randes des Sticks?
                  x - radius >= currentPositionStick['x'] && x - radius <= currentPositionStick['x'] + 10*stickLength){
                    if(bomb){ //POWERUP: BOMBE
                        lostLife();
                        newSoundEffect("bombSound");
                    }else{ //ABPRALL-BERECHNUNG
                        if(x <= currentPositionStick['x'] + 5*stickLength){ //trifft LINKE HÄLFTE.
                            if(x <= currentPositionStick['x'] + 1*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                                SteigungBall = 3; //15°
                            }else if(x <= currentPositionStick['x'] + 2*stickLength && x >= currentPositionStick['x'] + 1*stickLength){
                                SteigungBall = 1; //30°
                            }else if(x >= currentPositionStick['x'] + 4*stickLength){
                                SteigungBall = 2; //60°
                            }else{
                                SteigungBall = 0;
                            }
                             DirectionBall = "up-left";
                        }else{
                            if(x >= currentPositionStick['x'] + 9*stickLength){ //Trifft der Ball auf den Randbereich des Sticks so ändert sich der Flugwinkel
                                SteigungBall = 3;
                            }else if(x >= currentPositionStick['x'] + 8*stickLength && x <= currentPositionStick['x'] + 9*stickLength){
                                SteigungBall = 1;
                            }else if(x <= currentPositionStick['x'] + 6*stickLength){
                                SteigungBall = 2;
                            }else{
                                SteigungBall = 0;
                            }
                            DirectionBall = "up-right";
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
            if(DirectionBall == "" && level != "Käster"){ //Wenn Ball noch nicht gestartet ist, bewegt er sich dem Stick entsprechend
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
                if(DirectionBall == "" && level != "Käster"){ //Wenn Ball noch nicht gestartet ist, bewegt er sich dem Stick entsprechend
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
    this.x = x;
    this.y = y;
    this.ic = ic;
    this.st = st;
    this.interval = "";
    
    this.startInterval = function(){
        this.interval = setInterval(function(){PowerUps[index].move();},speedPowerUp);
    };
    
    this.move = function(){
        if(this.y < canvas.height){  
            ctx.clearRect(this.x,this.y,PsizeWidth,PsizeHeight); //LÃ¶sche Power-Up
            if(level != "Käster"){
                this.y += 1; //Y-Einheiten in welchem das Power-Up sich nach unten bewegt
            }else{
                this.y = this.y + 8;
            }
            ctx.drawImage(this.ic,this.x,this.y,PsizeWidth,PsizeHeight); //Zeichne Power-Up
            if(this.y + PsizeHeight >= currentPositionStick['y'] && this.x + PsizeHeight >= currentPositionStick['x'] && this.x <= currentPositionStick['x'] + 10*stickLength){ //Kollisionsabfrage
                ctx.clearRect(this.x,this.y,PsizeWidth,PsizeHeight); //LÃ¶sche Power-Up aus Canvas
                clearInterval(this.interval);
                this.y = canvas.height;
                choosePowerUp(this.st);
            }
        }else{
            clearInterval(this.interval);
        }
    };
    
    this.stop = function(){
        clearInterval(this.interval);
    };
}
function newPowerUp(i){  
    if(createPowerUp() && i != "Käster"){ //Zufallswert um ein Power-Up zu erzeugen
        randomPowerUp(); //Generiere ZufÃ¤lliges Power-Up
        PowerUps[indexPowerUp] = new PowerUp(blocks[i][0] + gridSizeBlocks,blocks[i][1] + 0.5*gridSizeBlocks,icon,state,indexPowerUp); //Erzeuges neues PowerUp
        PowerUps[indexPowerUp++].startInterval();   //starte Animations-Loop
    }
    if(i == "Käster"){ //KÄSTER LEVEL
        state = "käster";
        icon = document.getElementById("laser");
        PowerUps[indexPowerUp] = new PowerUp(curPosBall['x'] - laser,curPosBall['y'] ,icon,state,indexPowerUp); //Erzeuges neues PowerUp
        PowerUps[indexPowerUp].startInterval();   //starte Animations-Loop
        indexPowerUp++; //Erhöhe Index-ZählerPowerUps[indexPowerUp] = new PowerUp(curPosBall['x'] - laser,curPosBall['y'] ,icon,state,indexPowerUp); //Erzeuges neues PowerUp
        PowerUps[indexPowerUp] = new PowerUp(curPosBall['x'] + laser,curPosBall['y'] ,icon,state,indexPowerUp); //Erzeuges neues PowerUp
        PowerUps[indexPowerUp].startInterval();   //starte Animations-Loop
        indexPowerUp++; //Erhöhe Index-Zähler
    }
}
function randomPowerUp(){
    var r = Math.round(Math.random()*11);
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
            if(difficulty != "Easy" && difficulty != "veryEasy"){
                state = "bomb";
                icon = document.getElementById("bomb");
            }
            break;
        case 10:
            state = "newBall";
            icon = document.getElementById("ball2");
        default:
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
            imgBall2 = document.getElementById("fireball");
            clearTimeout(timeoutPowerBall);
            timeoutPowerBall = setTimeout(function(){resetPowerUp("powerBall")},10000); //Reset nach 10 Sek.
            newTimer("fireball",10);
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
            newTimer("cartman",3);
            break;
        case "gun":
            newTextPopUp("Let's Rock Dude!");
            shootPossible = true;
            imgStick = document.getElementById("stick-gun");
            clearTimeout(timeout);
            timeout = setTimeout(function(){resetPowerUp("gun");},7000);
            newTimer("gun",7);
            break;
        case "autopilot":
            newTextPopUp("Autopilot: ON");
            clearInterval(intervalAutopilot);
            clearTimeout(timeoutAutopilot);
            intervalAutopilot = setInterval(autopilot,10);
            timeoutAutopilot = setTimeout(function(){resetPowerUp("autopilot");},7000);
            newTimer("autopilot",7);
            break;
        case "bomb":
                clearTimeout(timeoutPowerBall); //PowerBall resetten
                resetPowerUp("powerBall");
            newTextPopUp("Don't touch me...");
            imgBall = document.getElementById("bomb");
            bomb = true;
            clearInterval(timeoutBomb);
            timeoutBomb = setTimeout(function(){resetPowerUp("bomb");},10000);  //Reset IMGBALL + BOMB = FALSE
            newTimer("bomb",10);
            break;
        case "newBall":
            newTextPopUp("New Balls!");
            for(var i = 0;i<3;i++){ //Anzahl neuer Bälle bei aufnahme des P.Ups
                balls[indexBall] = new newBall(curPosBall['x'],curPosBall['y']);
                balls[indexBall++].startInterval();
            }
            break;
        case "käster":
            kästerFireHitYou();
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
        case "PowerUps":
            PowerUps = [];
            indexPowerUp = 0;
            break;
        case "bomb":
            imgBall = document.getElementById("ball");
            bomb = false;
            break;
        case "gun":
            clearInterval(timeoutShootAllowed);
            imgStick = document.getElementById("stick");
            shootPossible = false;
            break;
        case "powerBall":
            powerBall = false;
            imgBall = document.getElementById("ball");
            imgBall2 = document.getElementById("ball2");
            break;
        case "autopilot":
            clearInterval(intervalAutopilot);
            flip = false;
            break;
        case "balls":
            balls = [];
            indexBall = 0;
    }
}

//---------------------- POWER UP: SCHIEßEN ------------------------------------
speedShoot = 5;
function newShoot(index,x,x2,y){  //KLASSEN DEKLARATION FÜR EINEN SCHUSS
    this.x = x;
    this.x2 = x2;
    this.y = y;
    
    this.startInterval = function(){
        this.interval = setInterval(function(){shoots[index].startShoot();},30);
    };
    
    this.startShoot = function(){
        ctx.fillStyle = "grey";
     
        ctx.clearRect(this.x-1,this.y,4,10);
        ctx.clearRect(this.x2-1,this.y,4,10);

        this.y = this.y - speedShoot;

        ctx.fillRect(this.x,this.y,2,10);
        ctx.fillRect(this.x2,this.y,2,10);
        if(level != "Käster"){
            collisionWithBlocks(index,this.x,this.x2,this.y);
        }else if(level == "Käster"){
            collisionWithKäster(index,this.x,this.x2,this.y);
        }
        if(this.y+10 < 0){
           clearInterval(this.interval);
        }
    };
    
    this.stop = function(){
        clearInterval(this.interval);
    };
}
function shoot(){   //START FUNKTION UM EINEN SCHUSS ZU ERZEUGEN
    if(shootPossible){
        shoots[indexShoot] = new newShoot(indexShoot,currentPositionStick['x'] + 0.5*stickLength,currentPositionStick['x'] + 9.5*stickLength,currentPositionStick['y'] - stickHeight);
        shoots[indexShoot].startInterval();
        indexShoot++;
        shootPossible = false;
        clearInterval(timeoutShootAllowed);
        timeoutShootAllowed = setTimeout(function(){shootPossible = true},100); //Erlaubt maximal einen Schuss alle 100ms
    }
}
function collisionWithBlocks(index,xShoot1,xShoot2,yShoot){ //PRÜFT AUF KOLLISION MIT BLÖCKEN
    for(var j = 0; j < blocks.length;j++){
        if(yShoot <= blocks[j][1] + gridSizeBlocks){
             if(xShoot1  >= blocks[j][0] && xShoot1 <= blocks[j][0] + 2*gridSizeBlocks ||
                xShoot2  >= blocks[j][0] && xShoot2 <= blocks[j][0] + 2*gridSizeBlocks){ //block[i][1] = Y-Koordinate
                    ctx.clearRect(blocks[j][0],blocks[j][1],2.3*gridSizeBlocks,1.3*gridSizeBlocks); //Lösche Block + Schatten
                    blocks.splice(j,1);
                    
                    clearInterval(shoots[index].interval);
                    
                    ctx.clearRect(xShoot1-1,yShoot,4,10);
                    ctx.clearRect(xShoot2-1,yShoot,4,10);
                    
                    updateScore();
                    if(blocks.length == 0){
                        levelComplete();
                        return;
                    }
            }   
        }
    }
}
function collisionWithKäster(index,xShoot1,xShoot2,yShoot){
    if(yShoot <= curPosBall['y'] + radius){
        if(xShoot1 >= curPosBall['x'] - radius && xShoot1 <= curPosBall['x'] + radius ||
           xShoot2 >= curPosBall['x'] - radius && xShoot2 <= curPosBall['x'] + radius){
                clearInterval(shoots[index].interval);
                ctx.clearRect(xShoot1-1,yShoot,4,10);
                ctx.clearRect(xShoot2-1,yShoot,4,10);
                hitKäster();
                return;
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
    document.getElementById("instruction").style.display = "none";
}
function showStartButtons(){
    document.getElementById("play_menu").style.display = "block";
    document.getElementById("pause_menu").style.display = "none";
}
function random(){ //Zufallszahlen-Generator 
    var a = Math.random() * 9;
    return (Math.round(a));
}         
function textAnimation(x){ //Animation, welcher den Timer kurz größer und wieder kleiner werden lässt
    if(x == 0){
        return;
    }else{
        if(x > 6){
            fontSize++;
            textPlace++;
            setTimeout(function(){textAnimation(x-1);},50);
        }else{
            fontSize--;
            textPlace--;
            setTimeout(function(){textAnimation(x-1);},50);
        }
    }
}
//-------------------- WAHRSCHEINLICHKEIT FÜR POWER UP -------------------------
function createPowerUp(){ //Wahrscheinlichkeit für das Erzeugen eines Power-Ups
    var a = Math.round(Math.random()*2);
    if(a == 0){
        return true;
    }else{
        return false;
    }
}
//------------------------------- TEXT - POPUPS --------------------------------
function newTextPopUp(text){
    new TextPopUp(currentPositionStick['x'] + 5*stickLength, currentPositionStick['y'] - 5).startInterval(text);
}
function TextPopUp(x,y){
    this.x = x;
    this.y = y;
    this.fade = 1.0;
    this.interval = "";
    var that = this;
    
    this.startInterval = function(text){
        this.interval = setInterval(function(){that.move(text);},50);
    };
    
    this.move = function(text){
        ctx.fillStyle = "rgba(255,0,0,"+this.fade+")"; 
        ctx.font="15px Arial";
        ctx.clearRect(this.x,this.y - 15,text.length*8,20);
        ctx.fillText(text,this.x,this.y);
        this.y = this.y - 1;
        this.fade = this.fade - 0.03;
        if(this.y < 350){
            clearInterval(this.interval);
            ctx.clearRect(this.x,this.y - 15,text.length*7,20);
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
function newTimer(icon,timer){
    for(var i=0;i<timerInterval.length;i++){ //Überprüfe ob ein PopUp der gleichen Art schon aktiv ist. Falls ja setze Zeit neu 
        if(icon == timerInterval[i].PowerUp){
            timerInterval[i].zahl = timer;
            timerInterval[i].fade = 1.0;
            return null;
        }
    }
    switch(positionTimer){ //Positionen der PopUps
        case 0:
            var imgx = 10;
            var x = 30;
            break;
        case 1:
            var imgx = 70;
            var x = 90;
            break;
        case 2:
            var imgx = 140;
            var x = 160;
            break;
        case 3:
            var imgx = 210;
            var x = 230;
            break; 
    }
    var imgy = canvas2.height*0.05; //X-Positionen immer gleich
    var y = canvas2.height*0.8;
    timerInterval[positionTimer] = new TimerPowerUp(icon,imgx,imgy,x,y,positionTimer,timer); //Erzeuge neues PopUp
    timerInterval[positionTimer].count(); //Rufe Timer Funktion auf
    positionTimer++; //Erhöhe die Position um 1 (wird immer wieder verringert, wenn ein PopUp ausläuft)
}
function TimerPowerUp(icon,imgx,imgy,x,y,index,zahl){
    this.PowerUp = icon;
    this.img = document.getElementById(icon);
    this.imgx = imgx;
    this.imgy = imgy;
    this.x = x;
    this.y = y;
    this.fade = 1.0;
    this.zahl = zahl;
       
    this.count = function(){
        ctx2.drawImage(this.img,this.imgx,this.imgy,18,18);
        ctx2.font="18px Arial";
        ctx2.fillStyle = "rgba(255,255,255,"+this.fade+")";
        if(this.zahl < 3.2){ //Farbe auf "Rot" ändern
            ctx2.fillStyle = "rgba(255,0,0,"+this.fade+")";
            if(this.zahl < 2){ //Langsam Ausblenden
                this.fade = this.fade - 0.05;
            }
        }
        if(this.zahl > 0.1){
            this.zahl -= 0.1;
            ctx2.clearRect(this.x,this.y-20,40,canvas2.height); //Text löschen
            ctx2.fillText(this.zahl.toFixed(1),this.x,this.y); //Text zeichnen
            setTimeout(function(){timerInterval[index].count();},100); //Funktion wieder aufrufen
        }else{
            this.PowerUp = ""; //Resette Zustand (Falls das PowerUp schon läuft, setze einfach Zahl wieder auf Startzeit)
            ctx2.clearRect(this.x-20,0,60,canvas2.height);
            if(timerInterval[index] != timerInterval[positionTimer-1]){
                this.changePosition();
            }else{
                positionTimer--; //Position neu freimachen
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
         if(timerInterval[index] != timerInterval[positionTimer-1]){ //Letztes PopUp?
             if(this.zahl < 0.1){ //Falls PopUp schon beendet wurde
                this.zahl = timerInterval[index+1].zahl;
                this.img = timerInterval[index+1].img;
                this.fade = timerInterval[index+1].fade;
                this.PowerUp = timerInterval[index+1].PowerUp;
                this.count();
             }else{ //Falls PopUp noch läuft
                this.zahl = timerInterval[index+1].zahl;
                this.img = timerInterval[index+1].img;
                this.fade = timerInterval[index+1].fade;
                this.PowerUp = timerInterval[index+1].PowerUp;
             } 
            ctx2.clearRect(this.x-20,0,60,canvas2.height);

            timerInterval[index+1].changePosition(); //Rufe selbes für nachfolgendes PopUp auf
         }else{
            this.zahl = 0; //Setze Timer der letzten Zahl auf 0 (wird somit gelöscht in count();
         }
    };    
 }
 function clearCanvas2(){ //Lösche komplettes Canvas2 + PowerUp Array
     for(var i=0;i<timerInterval.length;i++){ 
        timerInterval[i].zahl = 0;
    }
    ctx2.clearRect(0,0,canvas2.width,canvas2.height);
    timerInterval = [];
    positionTimer = 0;
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
    radius = 65;
    imgBall = document.getElementById("kästerBall");
    shootPossible = true;
    imgStick = document.getElementById("stick-gun");
    currentPositionStick['y'] = 380;
    curPosBall['y'] = 60;
    leben = 1;
    stickLength = 10;
    speedShoot = 20;
    PsizeWidth = 4; //Bestimmt Größe des Lasers
    PsizeHeight = 20; 
    speedPowerUp = 20; //Bestimmt Animationsgeschwindigkeit des Lasers
    document.getElementById("lifes").innerHTML = leben;
    document.getElementById("kästerLife").innerHTML = 50;
    document.getElementById("score_div").style.display = "none";
    document.getElementById("käster_div").style.display = "block";
    document.getElementById("canttouchthis").pause();
}
function hitKäster(){//Wird bei Treffer von Käster ausgelöst
    ctx.clearRect(curPosBall['x'] - radius, curPosBall['y'] - radius, 2*radius,2*radius); // Lösche BALL
    radius = radius - 1;
    if(radius % 6 == 0){
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
    
    document.getElementById("kästerLife").innerHTML = --KästerLeben;
    if(KästerLeben % 2 == 0){
        newSoundEffect("hit");
    }else{
        newSoundEffect("hit2");
    }
    
    if(KästerLeben == 0){
        alert("Congratulation!\nYou defeated Käster!");
        shootPossible = false;
        sound.currentTime = 0;
        pause();
        showStartButtons();
        defeatedKäster();
    }    
}
function moveKäster(){ //Berechnet die Bewegung von Käster!
    var random = Math.random()*50;
    if(random < 1){
        if(DirectionBall == "right"){
            DirectionBall = "left";
        }else{
            DirectionBall = "right";
        }
    }
        switch(DirectionBall){
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
        DirectionBall = "right";
    }else if(curPosBall['x'] + radius >= canvas.width){
        DirectionBall = "left";
    }
}
function kästerFire(){
    newPowerUp("Käster");
    newSoundEffect("soundGun");
    timeoutFire = setTimeout(kästerFire,speedFireKäster);
}
function kästerFireHitYou(){
    leben = 0;
    document.getElementById("lifes").innerHTML = leben;
    alert("Käster defeated YOU");
    shootPossible = false;
    pause();
    showStartButtons(); 
    KästerWon();
}
function defeatedKäster(){
    newSoundEffect("canttouchthis");
    ctx.clearRect(0,0,canvas.width,canvas.height)
    credits();
}
function KästerWon(){
        newSoundEffect("evilLaugh"); 
        ctx.drawImage(document.getElementById("kästerWon"),180,0,400,400);
}
function resetKästerLevel(){
    document.getElementById("score_div").style.display = "block";
    document.getElementById("käster_div").style.display = "none";
    speedPowerUp = 20; //Bestimmt Animationsgeschwindigkeit nach unten
    PsizeWidth = 35; //Bestimmt Größe der Power Ups
    PsizeHeight = 35;
    speedShoot = 5;
}
//----------------------------- LEVEL 4 Fragen ---------------------------------
function newQuestion(frage){
    $("#question").text(frage);
    $("#question").css({"color":"White"});
    for(var i = 1;i<arguments.length;i++){
        $("#answer"+i+"").text(""+i+".) " + arguments[i]);
        $("#answer"+i+"").fadeIn();
        $("#answer"+i+"").css({"color":"White","fontSize":"20"});
    }      
    $("#question").fadeIn(1500,function(){  
        $("#answers").slideToggle(2000);
    }); 
    setTimeout(function(){new newTimer("clock",10)},2000);
    timeoutQuestion = setTimeout(function(){wrongAnswer(0);},12000);
    answerpossible = true;
    question++;
}
function answerQuestion(taste){
    if(!answerpossible)return null;
    if(taste == CorrectAnswer)correctAnswer(taste);
    else wrongAnswer(taste);
}
function correctAnswer(taste){
    newTextPopUp("correct!");
    clearTimeout(timeoutQuestion);
    $("#answer"+taste+"").css({"color":"green"});
    $("#answer"+taste+"").animate({"fontSize":"25"},1000,function(){
        $("#question").fadeOut(1500,function(){  
             $("#answers").slideUp(function(){
                 $("#answer"+taste+"").animate({"fontSize":"16"});
             });
        });
        for(var i = 1;i<6;i++){
            $("#answer"+i+"").fadeOut(1500);
        } 
    });
   
    answerpossible = false;
    clearCanvas2();
}
function wrongAnswer(taste){ // taste = 0, wenn Zeit abgelaufen ist
    clearTimeout(timeoutQuestion); //timeout clearen, für timer
    if(taste != 0) newTextPopUp("Wrong !!!");
    else newTextPopUp("Time over...");
    intervalBall.push(setInterval(drawBall,speed)) //Ball schneller machen
    if(taste == 0) { for(var i = 1;i<6;i++){$("#answer"+i+"").css({"color":"red"});};
        $("#question").css({"color":"red"});
        $("#question").fadeOut(1000,function(){  
                $("#answers").slideUp();
            });
        for(var i = 1;i<6;i++){
            $("#answer"+i+"").fadeOut(1000);
        }  }
    //Wird nicht durchlaufen wenn taste = 0
    $("#answer"+taste+"").css({"color":"red"});
    $("#answer"+taste+"").animate({"fontSize":"25"},1000,function(){
            $("#question").fadeOut(1000,function(){  
                $("#answers").slideUp(function(){
                    $("#answer"+taste+"").animate({"fontSize":"16"});
                });
            });
        for(var i = 1;i<6;i++){
            $("#answer"+i+"").fadeOut(1000);
        }  
    });
          
    answerpossible = false;
    clearCanvas2();
}
//----------------------------- CREDITS ----------------------------------------
function credits(){
    endCutText = [];
    document.getElementById("canvas").style.backgroundImage = "";
    ctx.drawImage(document.getElementById("kästerBallTot"),180,0,400,400);
    setTimeout(function(){blendoutKäster(1.0,180,0,400,400);},1000);
}
function blendoutKäster(alpha,x,y,width,height){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha = alpha;
    var käster = document.getElementById("kästerBallTot");
    ctx.drawImage(käster,x,y,width,height);  
    if(alpha >= 0){
        setTimeout(function(){blendoutKäster(alpha-0.05,x+10,y+10,width-20,height-20);},50); 
    }else{
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.globalAlpha = 1;
        setTimeout(EndCut,1000);
    }
}
function EndCut(){
    document.getElementById("play_menu").style.display = "none";
    document.getElementById("käster_div").style.display = "none";
    document.getElementById("life_div").style.display = "none";
    document.getElementById("instruction").style.display = "none";
    $("#headline").text("");
    $("#version").text("");
    
    endCutText.push(new newEndCutText("Credits",50,canvas.width/2-100,canvas.height/2,0));
    endCutText.push(new newEndCutText("Game Designer",25,canvas.width/2-105,canvas.height/2,1));
    endCutText.push(new newEndCutText("Silvan Hau",20,canvas.width/2-70,canvas.height/2,2));
    endCutText.push(new newEndCutText("Music",25,canvas.width/2-60,canvas.height/2,3));
    endCutText.push(new newEndCutText("Level 1: Radioactive",20,canvas.width/2-110,canvas.height/2,4));
    endCutText.push(new newEndCutText("Level 2: Get Lucky",20,canvas.width/2-105, canvas.height/2,5));
    endCutText.push(new newEndCutText("Level 3: What is Love",20,canvas.width/2-115,canvas.height/2,6));
    endCutText.push(new newEndCutText("Final: The Final Countdown",20,canvas.width/2-140,canvas.height/2,7));
    endCutText.push(new newEndCutText("Endcut: Can't touch this",20,canvas.width/2-120,canvas.height/2,8));
    endCutText.push(new newEndCutText("Thanks for Playing!!!",50,canvas.width/2-220,canvas.height/2,9));   
    endCutText.push(new newEndCutText("The End",50,canvas.width/2-100,canvas.height/2,10));
   
    endCutText[0].animate();
    setTimeout(function(){endCutText[1].animate();},3000);
    setTimeout(function(){endCutText[2].animate();},5000);
    setTimeout(function(){endCutText[3].animate();},8000);
    setTimeout(function(){endCutText[4].animate();},10000);
    setTimeout(function(){endCutText[5].animate();},12000);
    setTimeout(function(){endCutText[6].animate();},14000);
    setTimeout(function(){endCutText[7].animate();},16000);
    setTimeout(function(){endCutText[8].animate();},18000);  
    setTimeout(function(){endCutText[9].animate();},22000);
    setTimeout(function(){endCutText[10].animate2();},28000);
}
function newEndCutText(text,font,x,y,index){
    this.fade = 0.1;
    this.x = x;
    this.font = ""+font+"px TimesNewRoman";
    this.y = y;
    
    this.animate = function(){
        ctx.fillStyle = "rgba(255,0,0,"+this.fade+")"; 
        ctx.font= this.font;
        ctx.clearRect(this.x,this.y-font,500,font*1.3);
        ctx.fillText(text,this.x,this.y);
        if(this.fade <= 1){ 
            this.fade = this.fade + 0.05;
            setTimeout(function(){endCutText[index].animate();},50);}
        else{      
            this.y = this.y - 1;
            if(this.y > -30) setTimeout(function(){endCutText[index].animate();},40);
        } 
    };
    
    this.animate2 = function(){
        ctx.fillStyle = "rgba(255,0,0,"+this.fade+")"; 
        ctx.font= this.font;
        ctx.clearRect(this.x,this.y-font,500,font*1.3);
        ctx.fillText(text,this.x,this.y);
        if(this.fade <= 1){ 
            this.fade = this.fade + 0.01;
            setTimeout(function(){endCutText[index].animate2();},100);} 
    };
}
//----------------------------- SOUND OPTIONS ----------------------------------
function newSoundEffect(sound){
    var soundeffect = document.getElementById(sound);
    soundeffect.currentTime = 0;
    soundeffect.play();
}
//-------------------- EVENT-REGLER FÜR TASTATUREINGABE ------------------------
document.onkeydown = function(event){
  var keyCode; 
  if(event == null)
  {
    keyCode = window.event.keyCode; 
  }
  else 
  {
    keyCode = event.keyCode; 
    if(keyCode == 76 && !allowPressKeys) document.getElementById("dev_menu").style.display = "block";
  }
  
  if(!allowPressKeys){
    return null;
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
        case 65: //A
            if(intervalAutopilot == "") intervalAutopilot = setInterval(autopilot,10),newTextPopUp("Infinite Autopilot...");   
            else clearInterval(intervalAutopilot), flip=false, intervalAutopilot = "",newTextPopUp("Remove Autopilot...");
            break;
        case 66: //B
            if(!bomb){
                bomb = true;
                imgBall = document.getElementById("bomb");
            }else{
                resetPowerUp("bomb");
            }
            break;
        case 83: //S
            shootPossible = true;
            newTextPopUp("Infinite Shoots...");
            imgStick = document.getElementById("stick-gun");
            break;
        case 87: //W
            if (level != "Käster"){
                balls[indexBall] = new newBall(curPosBall['x'],curPosBall['y']);
                balls[indexBall++].startInterval();
            }
            break;
        case 68: //D
            //IntervalFinalTimer = setInterval(FinalTimer,100);  //Zum testen    
            break;
        case 49: //1
            answerQuestion(1);
            break;
        case 50: //2
            answerQuestion(2);
            break;
        case 51: //3
            answerQuestion(3);
            break;
        case 52: //4
            answerQuestion(4);
            break;
        case 53: //5
            answerQuestion(5);
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
                    if(DirectionBall == "" && level != "Käster"){ //Falls Ball noch nicht gestartet ist
                        ctx.clearRect(curPosBall['x'] - radius, curPosBall['y'] - radius, 2*radius,2*radius);
                        curPosBall['x'] = x + 5*stickLength; //Neue Position des Balls
                        ctx.drawImage(imgBall,curPosBall['x'] - radius,curPosBall['y'] - radius,2*radius,2*radius);
                    }
                }
        }
    }   
}
