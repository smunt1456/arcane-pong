// TODO: racket control
// TODO: minor things in comments that are not fleshed out yet
var bgImage;
var bgImagePlaying;
var font;
const STATE_ERROR = -1;
const STATE_WELCOME = 0;
const STATE_CHARSELECT = 1;
const STATE_PLAYING = 2;
const STATE_SCORE = 3;
const STATE_WINNER = 4;
var currentState = 0;
const SPACE = 32;
const A = 65;
const Z = 90;
const SLASH = 191;
const X = 88;
var ready = false;
var charCount = 0;

var ballDiameter = 6; // Percentage of vmin
var racketWidth = 3; // Percentage of width
var racketHeight = 30; // Percentage of height
var ballMinVelocityH = 4; // Percent of width
var ballMaxVelocityH = 9; // Percent of width
var racketAccelerationFactor = 0.2;
var racketFrictionFactor = 0.2;
var leftRacketForce = 0;
var rightRacketForce = 0;
var leftRacket = {
  name: "left",
  character: "",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  yVelocity: 0,
  yAcceleration: 0.2,
  yWallBounce: 0.4,
  yFriction: 0.2,
  meter: 0,
  maxMeter: 0,
  meterActive: false,
  stunned: false,
  caitlynUltimate: false,
  viUltimate: false,
  xMove: 0,
  color: ""
}

var rightRacket = {
  name: "right",
  character: "",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  yVelocity: 0,
  yAcceleration: 0.2,
  yWallBounce: 0.4,
  yFriction: 0.2,
  meter: 0,
  maxMeter: 0,
  meterActive: false,
  stunned: false,
  caitlynUltimate: false,
  viUltimate: false,
  xMove: 0,
  color: ""
}
var ball = {
  x: 0,
  y: 0,
  diameter: 0,
  xVelocity: 0,
  yVelocity: 0,
  frameCountAtLastBounce: 0
}
var currentDirection = ball.xVelocity;
var debounceForFrames = 5;
var score = {
  left: 0,
  right: 0
}
var scoreLimit = 5;
var scoreTimeout;
var scoreTimeoutDelay = 3000; // Milliseconds (0.001 seconds)

function preload() {
  font = loadFont('./assets/fonts/DotGothic16-Regular.ttf');
  bgImage = loadImage('./assets/img/background-welcome.png');
  bgImagePlaying = loadImage('./assets/img/background-playing.png');
}

function setup() {
  canvas2D = createCanvas(windowWidth, windowHeight);
  rightRacket.xMove = windowWidth;
  setPositionsAndDimensionsForPlaying();
  characterSelection();
  $("#charGifs div").hide();
  $("#ultimates div").hide();
}

function draw() {
  switch (currentState) {
    case STATE_WELCOME:
      drawForWelcome();
      break;
    case STATE_PLAYING:
      drawForPlaying();
      break;
    case STATE_CHARSELECT:
      drawForCharSelect();
      break;
    case STATE_SCORE:
      drawForScore();
      break;
    case STATE_WINNER:
      drawForWinner();
      break;
    case STATE_ERROR:
      drawForError();
      break;
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setPositionsAndDimensionsForPlaying();
}

function keyPressed() {
  switch (currentState) {
    case STATE_WELCOME:
      if (keyCode === SPACE) { // SPACE BAR
        changeState(STATE_CHARSELECT);
      }
      break;
    case STATE_CHARSELECT:
      break;
    case STATE_PLAYING:
      break;
  }
}

function setPositionsAndDimensionsForPlaying() {
  ball.x = windowWidth / 2;
  ball.y = windowHeight / 2;
  ball.diameter = vmin(ballDiameter);

  leftRacket.width = racketWidth * 0.01 * windowWidth;
  leftRacket.height = racketHeight * 0.01 * windowHeight;
  leftRacket.x = 0;
  leftRacket.y = windowHeight / 2 - leftRacket.height / 2;
  leftRacket.meter = 0;
  leftRacket.caitlynUltimate = false;

  rightRacket.width = racketWidth * 0.01 * windowWidth;
  rightRacket.height = racketHeight * 0.01 * windowHeight;
  rightRacket.x = windowWidth - rightRacket.width;
  rightRacket.y = windowHeight / 2 - rightRacket.height / 2;
  rightRacket.meter = 0;
  leftRacket.caitlynUltimate = false;

  charCount = 0;
  ready = false;

  console.log("resetPositionsAndDimensionsForPlaying", {
    ballX: ball.x,
    ballY: ball.y,
  });

  currentDirection = ball.xVelocity;
for (let i = 0; i <= leftRacket.maxMeter; i++) {
  $("#" + leftRacket.name + "Meter" + i).removeClass("active");
}
for (let i = 0; i <= rightRacket.maxMeter; i++) {
$("#" + rightRacket.name + "Meter" + i).removeClass("active");
}
  $("#STATE_CHARSELECT").hide();
  $("#STATE_WINNER").hide();
  $("#STATE_PLAYING").hide();
  $("#charReady").hide();
  $("#STATE_WELCOME").hide();
}

function drawForWelcome() {
  $("#STATE_WELCOME").show();
  $("body").show();
  background(bgImage);
  push();
  textAlign(CENTER, CENTER);
  textSize(vmin(15));
  textStyle(BOLD);
  noStroke();
  fill(255);
  textFont(font);
  text("ARCANE PONG", windowWidth/2, windowHeight/4);
  pop();

  push();
  var date = new Date();
  if (date.getSeconds() % 2 == 0) {
    textAlign(CENTER, CENTER);
    textSize(vmin(6));
    textFont(font);
    fill(255);
    text("Press SPACE to start!", windowWidth/2, windowHeight / 1.5);
  }
  pop();
}

function drawForCharSelect() {
  background("#2C2935");
  $("body").css("background-image", "none");

  $("#charReady").hide();
  $(".character").show();
  textAlign(CENTER, CENTER);
  textSize(vmin(8));
  textStyle(BOLD);
  noStroke();
  fill(255);
  textFont(font);
  text("Choose your Fighter!!", windowWidth/2, windowHeight/5);
  $("#STATE_CHARSELECT").show();
  fill("#1AB7CF");
  ellipse(windowWidth / 8, windowHeight / 2.5, 270, 40);
  fill("#DCB81B");
  ellipse(windowWidth / 1.15, windowHeight / 2.5, 270, 40);
  characterSelection();
  if (ready) {
    charReady();
  }
}

function characterSelection() {
  //select char 1
  $(".character").click(function () {
    if (charCount < 1) {
      $(this).addClass("clickedChar1");
      charCount++;
      console.log(charCount);
      // char1 = char
      leftRacket.character = $(this).text();
      setCharacter(leftRacket);
      console.log(leftRacket.character);
      $("#p1Character" + $(this).text()).show();
    }
  });
  //select char 2
  $(".character").click(function () {
    if (charCount == 1 && !$(this).hasClass("clickedChar1")) {
      $(this).addClass("clickedChar2");
      charCount++;
      console.log(charCount);
      // char2 = char
      rightRacket.character = $(this).text();
      setCharacter(rightRacket);
      console.log(rightRacket.character,);
      $("#p2Character" + $(this).text()).show();

      //Ready
      ready = true;
      console.log(ready);
    }
  });
  // NOW reveal continue and back
  // click continue --> change state to playgame
  // click back --> reselect chars
}

function setCharacter(racket) {
  if (racket.character == "EKKO") {
    racket.maxMeter = 5;
    racket.color = "#9A5252";
  } else if (racket.character == "CAITLYN") {
    racket.maxMeter = 3;
    racket.color = "#573F86";
  } else if (racket.character == "VI") {
    racket.maxMeter = 2;
    racket.color = "#C64B6C";
  } else if (racket.character == "JINX") {
    racket.maxMeter = 1;
    racket.color = "#51AAF7";
  }
}

function charReady() {
  console.log(ready);
  $("#charReady").show();
  $("#back").click(function () {
    charCount = 0;
    ready = false;
    $("#STATE_CHARSELECT button").removeClass("clickedChar1");
    $("#STATE_CHARSELECT button").removeClass("clickedChar2");
    $("#charReady").hide();
    $("#charGifs div").hide();
    console.log(charCount, ready);
  });
  $("#start").click(function () {
    console.log(leftRacket.character, leftRacket.maxMeter, "left");
    console.log(rightRacket.character, rightRacket.maxMeter, "right");
    $("#STATE_CHARSELECT button").removeClass("clickedChar1");
    $("#STATE_CHARSELECT button").removeClass("clickedChar2");
    $("#charReady").hide();
    $("#charGifs div").hide();
    $("#STATE_CHARSELECT").hide();
    changeState(STATE_PLAYING);
  });
}

function drawForPlaying() {
  console.log(leftRacket.character, rightRacket.character)
  if (rightRacket.y < 0) {
    rightRacket.y = 0;
  } else if (rightRacket.y + rightRacket.height > height) {
    rightRacket.y = height - rightRacket.height;
  }

  if (leftRacket.y < 0) {
    leftRacket.y = 0;
  } else if (leftRacket.y + leftRacket.height > height) {
    leftRacket.y = height - leftRacket.height;
  }
  $("#STATE_PLAYING").show();
  for (let i = 1; i < leftRacket.maxMeter + 1; i++) {
    $("#leftMeter" + i).addClass("meterUnit");
  }
  for (let i = 1; i < rightRacket.maxMeter + 1; i++) {
    $("#rightMeter" + i).addClass("meterUnit");
  }
  background(bgImagePlaying);

  if (leftRacket.viUltimate) {
    spawnCircle(leftRacket, rightRacket);
  } else if (rightRacket.viUltimate) {
    spawnCircle(rightRacket, leftRacket);
  }

  if (leftRacket.stunned) {
    leftRacketForce = 0;
  } else if (keyIsDown(A) === true) {
    leftRacketForce = -1;
  } else if (keyIsDown(Z) === true) {
    leftRacketForce = 1;
  } else {
    leftRacketForce = 0;
  }

  if (rightRacket.stunned) {
    rightRacketForce = 0;
  } else if (keyIsDown(UP_ARROW) === true && rightRacket.y >= 0) {
    rightRacketForce = -1;
  } else if (keyIsDown(DOWN_ARROW) === true) {
    rightRacketForce = 1;
  } else {
    rightRacketForce = 0;
  }

  if (keyIsDown(X) === true) {
    if (leftRacket.meter > 0 &&
      leftRacket.meter < leftRacket.maxMeter &&
      ball.xVelocity < 0 &&
      !leftRacket.meterActive) {
      activateMeter(leftRacket);
    } else if (leftRacket.meter == leftRacket.maxMeter &&
      ball.xVelocity < 0) {
      useUltimate(leftRacket, rightRacket);
    }
  }
  if (keyIsDown(SLASH) === true) {
    if (rightRacket.meter > 0 &&
      rightRacket.meter < rightRacket.maxMeter &&
      ball.xVelocity > 0 &&
      !rightRacket.meterActive) {
      activateMeter(rightRacket);
    } else if (rightRacket.meter == rightRacket.maxMeter &&
      ball.xVelocity > 0) {
      useUltimate(rightRacket, leftRacket);
    }
  }

  // COLLISION DETECTIONS
  // Ball vs top edge and bottom edge
  if (ball.y <= 0 + ball.diameter / 2) {
    ball.yVelocity *= -1;
  } else if (ball.y >= height - ball.diameter / 2) {
    ball.yVelocity *= -1;
  }

  // Ball vs left racket and right bracket
  if (frameCount > ball.frameCountAtLastBounce + debounceForFrames) {
    if (ball.y >= leftRacket.y - ball.diameter / 2 &&
      ball.y <= leftRacket.y + leftRacket.height + ball.diameter / 2 &&
      ball.x <= leftRacket.x + leftRacket.width + ball.diameter / 2
    ) {
      ball.xVelocity *= -1;
      if (leftRacket.meterActive) {
        meterUsed(leftRacket);
      }
      if (rightRacket.meterActive) {
        ball.xVelocity /= 2;
        rightRacket.meterActive = false;
      }

      if (leftRacket.caitlynUltimate) {
        ball.xVelocity *= 4;
      }

      if (rightRacket.caitlynUltimate) {
        ball.xVelocity /= 4;
        rightRacket.caitlynUltimate = false;
      }

      if (leftRacket.character == "JINX") {
        leftRacket.yAcceleration *= 1.2;
        leftRacket.yFriction *= 1.1;
        leftRacket.yWallBounce *= 0.8;
      }
      console.log("new " + ball.xVelocity);
      ball.frameCountAtLastBounce = frameCount;
    } else if (ball.y >= rightRacket.y - ball.diameter / 2 &&
      ball.y <= rightRacket.y + rightRacket.height + ball.diameter / 2 &&
      ball.x >= rightRacket.x - ball.diameter / 2
    ) {
      ball.xVelocity *= -1;
      if (rightRacket.meterActive) {
        meterUsed(rightRacket);
      }
      if (leftRacket.meterActive) {
        ball.xVelocity /= 2;
        leftRacket.meterActive = false;
      }

      if (rightRacket.caitlynUltimate) {
        ball.xVelocity *= 4;
      }

      if (leftRacket.caitlynUltimate) {
        ball.xVelocity /= 4;
        leftRacket.caitlynUltimate = false;
      }

      if (rightRacket.character == "JINX") {
        rightRacket.yAcceleration *= 1.2;
        rightRacket.yFriction *= 1.1;
        rightRacket.yWallBounce *= 0.8;
        console.log(rightRacket.yAcceleration, rightRacket.yFriction, rightRacket.yWallBounce)
      }

      ball.frameCountAtLastBounce = frameCount;
      console.log("new " + ball.xVelocity);
    }
  }



  // Left racket vs top edge
  // Left racket vs bottom edge
  // Right racket vs top edge
  // Right racket vs bottom edge

  if (leftRacket.y == 0 ||
    leftRacket.y + leftRacket.height >= height) {
    leftRacket.yVelocity = -(leftRacket.yVelocity * leftRacket.yWallBounce);
    // when touching wall, cannot input up
  }

  if (rightRacket.y == 0 ||
    rightRacket.y + rightRacket.height >= height) {
    rightRacket.yVelocity = -(rightRacket.yVelocity * rightRacket.yWallBounce);
    // when touching wall, cannot input up
  }


  // Ball vs left edge
  // Ball vs right edge
  var hasAddedToScore = false;
  if (ball.x <= 0 + ball.diameter / 2) {
    // Right player scores
    score.right++;
    hasAddedToScore = true;
  } else if (ball.x >= width - ball.diameter / 2) {
    // Left player scores
    score.left++;
    hasAddedToScore = true;
  }
  if (hasAddedToScore) {
    if (score.left >= scoreLimit || score.right >= scoreLimit) {
      $("#STATE_PLAYING").hide();
      changeState(STATE_WINNER);
    } else {
      rightRacket.stunned = false;
      leftRacket.stunned = false;
      changeState(STATE_SCORE);
      resetJinx(leftRacket);
      resetJinx(rightRacket);
    }
  }

  function resetJinx(racket) {
    racket.yAcceleration = 0.2;
    racket.yFriction = 0.2;
    racket.yWallBounce = 0.8;
    racket.meterUsed = false;
    racket.meterActive = false;
  }

  // Move the ball
  ball.x += ball.xVelocity;
  ball.y += ball.yVelocity;
  // Move left racket
  if (leftRacketForce == 1) { // Accelerate down
    // leftRacket.yVelocity += racketAccelerationFactor;
    leftRacket.yVelocity += leftRacket.yAcceleration;
  } else if (leftRacketForce == -1) { // Accelerate up
    // leftRacket.yVelocity -= racketAccelerationFactor;
    leftRacket.yVelocity -= leftRacket.yAcceleration;
  } else if (leftRacket.yVelocity != 0) { // Slow down
    // leftRacket.yVelocity *= racketFrictionFactor;
    leftRacket.yVelocity *= leftRacket.yFriction;
  }
  leftRacket.y += leftRacket.yVelocity;
  // Move right racket
  if (rightRacketForce == 1) {
    // rightRacket.yVelocity += racketAccelerationFactor;
    rightRacket.yVelocity += rightRacket.yAcceleration;
  } else if (rightRacketForce == -1) {
    // rightRacket.yVelocity -= racketAccelerationFactor;
    rightRacket.yVelocity -= rightRacket.yAcceleration;
  } else if (rightRacket.yVelocity != 0) {
    // rightRacket.yVelocity *= racketFrictionFactor;
    rightRacket.yVelocity *= rightRacket.yFriction;
  }
  rightRacket.y += rightRacket.yVelocity;

  // Draw background
  // Draw ball
  fill(255)
  circle(ball.x, ball.y, ball.diameter);
  // Draw left racket
  fill(leftRacket.color);
  rect(leftRacket.x, leftRacket.y, leftRacket.width, leftRacket.height);
  // Draw right racket
  fill(rightRacket.color);
  rect(rightRacket.x, rightRacket.y, rightRacket.width, rightRacket.height);

  if (currentDirection != ball.xVelocity) {
    addMeter(ball.xVelocity);
  }
  currentDirection = ball.xVelocity;

}

function addMeter(ballVelocity) {
  if (ballVelocity < 0 && rightRacket.meter < rightRacket.maxMeter) {
    rightRacket.meter++;
    $("#rightMeter" + rightRacket.meter).addClass("active");
  } else if (ballVelocity > 0 && leftRacket.meter < leftRacket.maxMeter) {
    leftRacket.meter++;
    $("#leftMeter" + leftRacket.meter).addClass("active");
  }
  console.log(leftRacket.meter, rightRacket.meter);


}

function useUltimate(racketOne, racketTwo) {
  if (racketOne.meter == racketOne.maxMeter) {
    racketOne.meter = 0;

    $("#" + racketOne.character + "Ultimate" + racketOne.name).show();
      setTimeout(function () {
        $("#" + racketOne.character + "Ultimate" + racketOne.name).hide();
        console.log("hidden");
      }, 3000);

    $("#" + racketOne.name + "Meter div").removeClass("active");
    console.log(racketOne.meter + " USE ULTIMATE " + racketOne.character);
    if (racketOne.character == "EKKO") {
      //  freeze opponent racket for 5 seconds
      console.log("ACTIVATE EKKO ULTIMATE");
      console.log("REWIND");
      racketTwo.stunned = true;
      console.log("STUNNED");
      setTimeout(function () {
        racketTwo.stunned = false;
        console.log("CLEAR");
      }, 5000);
    } else if (racketOne.character == "CAITLYN") {
      console.log("ACTIVATE CAITLYN ULTIMATE");
      racketOne.caitlynUltimate = true;
    } else if (racketOne.character == "VI") {
      // make projectile
      console.log(racketOne.name)
      racketOne.viUltimate = true;
      // launch horizontally
      // when y of projectile == y of racket activate stun for 1.5 seconds
    } else if (racketOne.character == "JINX") {
      console.log(racketOne.yAcceleration);
      console.log("NUKE");
      activateMeter(racketOne);
    }
  }
}

function spawnCircle(racketOne, racketTwo) {
  console.log("abcdef");
  fill("#9B304D");
  if (racketOne.name == "left") {
    var yCircle = racketOne.y + (racketOne.height / 2);
    circle(racketOne.xMove, yCircle, 60);
    racketOne.xMove += 10;
    console.log(racketOne.viUltimate);
    if ((racketOne.xMove >= racketTwo.x && racketOne.xMove <= racketTwo.x + racketTwo.width) &&
      (yCircle >= racketTwo.y && yCircle <= racketTwo.y + racketTwo.height)) {
      console.log("collision");
      racketTwo.stunned = true;
      console.log("STUNNED");
      setTimeout(function () {
        racketTwo.stunned = false;
        console.log("CLEAR");
      }, 3000);
    }
    if (racketOne.xMove > windowWidth || racketOne.xMove < 0) {
      racketOne.viUltimate = false;
      racketOne.xMove = 0;
    }
  } else {
    console.log(racketOne.xMove, racketOne.name);
    var yCircle = racketOne.y + (racketOne.height / 2);
    circle(racketOne.xMove, yCircle, 60);
    racketOne.xMove -= 10;
    console.log(racketOne.viUltimate);
    if ((racketOne.xMove >= racketTwo.x && racketOne.xMove <= racketTwo.x + racketTwo.width) &&
      (yCircle >= racketTwo.y && yCircle <= racketTwo.y + racketTwo.height)) {
      console.log("collision");
      racketTwo.stunned = true;
      console.log("STUNNED");
      setTimeout(function () {
        racketTwo.stunned = false;
        console.log("CLEAR");
      }, 3000);
    }
    if (racketOne.xMove > windowWidth || racketOne.xMove < 0) {
      racketOne.viUltimate = false;
      racketOne.xMove = windowWidth;
    }
  }
}

function activateMeter(racket) {
  racket.meterActive = true;
  console.log("meter activated");
  $("#" + racket.name + "Meter" + racket.meter).removeClass("active");
  racket.meter--;
}

function meterUsed(racket) {
  if (racket.character == "JINX") {
    ball.xVelocity *= 2.5;
  } else {
    ball.xVelocity *= 2;
  }
  console.log(racket.meter + " USE METER " + racket.character);
  console.log(ball.xVelocity);
}

// +1 bar for each meter unit

function drawForScore() {
  console.log("drawForScore");
  background(0, 0, 0);
  textSize(vmin(30));
  textAlign(CENTER, CENTER);
  text(score.left, windowWidth / 3, windowHeight / 2);
  text(score.right, windowWidth * 2 / 3, windowHeight / 2);
  text(":", width / 2, height / 2);
}

function drawForWinner() {
  background("#2C2935");
  textAlign(CENTER, CENTER);
  textSize(vmin(15));
  textStyle(BOLD);
  noStroke();
  fill("#DCC830");
  $("#STATE_WINNER").show();
  var winnerString;
  if (score.left > score.right) {
    winnerString = "Left player wins!";
  } else {
    winnerString = "Right player wins!";
  }
  text(winnerString, windowWidth / 2, windowHeight / 3);

  $("#exit").click(function () {
    $("#STATE_WINNER").hide();
    clear();
    changeState(STATE_WELCOME);
    setPositionsAndDimensionsForPlaying();

  });
  $("#restart").click(function () {
    background(255, 255, 255, 0);
    changeState(STATE_PLAYING);
    setPositionsAndDimensionsForPlaying();
    $("#STATE_WINNER").hide();
  });

  score.left = 0;
  score.right = 0;
}

function drawForError() {
  colorMode(RGB);
  console.log("ERROR STATE");
  background(255, 0, 0);
}

function changeState(state) {
  // Check if State is valid
  if (!isValidState(state)) {
    console.log("changeState... is not valid state");
    changeState(STATE_ERROR);
    return;
  }
  // Check if id is equal to current state ---> do nothing
  if (state == currentState) return;

  currentState = state;

  switch (state) {
    case STATE_PLAYING:
      // Set the ball at the center
      ball.x = windowWidth / 2;
      ball.y = windowWidth / 2;
      // Launch the ball in a random direction
      let aspectRatio = windowWidth / windowHeight;
      let horizontalVelocity = Math.random() * (ballMaxVelocityH - ballMinVelocityH) + ballMinVelocityH;
      let verticalVelocity = Math.random() * (ballMaxVelocityH / aspectRatio * 1.5 - ballMinVelocityH / aspectRatio * 1.5) + ballMinVelocityH / aspectRatio * 1.5;
      if (Math.random() < 0.5) {
        horizontalVelocity *= -1;
        rightRacket.meter -= 1;
      } else {
        leftRacket.meter -= 1;
      }
      if (Math.random() < 0.5) {
        verticalVelocity *= -1;
      }
      ball.xVelocity = horizontalVelocity;
      ball.yVelocity = verticalVelocity;

      // Set the rackets at the center
      leftRacket.y = height / 2 - leftRacket.height / 2;
      leftRacket.yVelocity = 0;
      rightRacket.y = height / 2 - rightRacket.height / 2;
      rightRacket.yVelocity = 0;
      break;
    case STATE_SCORE:
      // Set timeout
      scoreTimeout = setTimeout(handleScoreTimeout, scoreTimeoutDelay);
      break;
  }

}


function handleScoreTimeout() {
  changeState(STATE_PLAYING);
}


function isValidState(id) {
  var result = false;

  switch (id) {
    case STATE_WELCOME:
    case STATE_CHARSELECT:
    case STATE_PLAYING:
    case STATE_SCORE:
    case STATE_WINNER:
    case STATE_ERROR:
      result = true;
      break;
  }

  return result;
}


function vmin(percentage) {
  var result = windowWidth;
  if (windowHeight < windowWidth) result = windowHeight;

  result = percentage * 0.01 * result;

  return result;
}

