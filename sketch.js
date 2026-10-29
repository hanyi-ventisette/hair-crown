// ------------------------------------------------------
// HAIR CROWN
// interactive audience poem
// whole-line curl version
// p5.js 2.x
// ------------------------------------------------------


// ------------------------------------------------------
// FONT
// ------------------------------------------------------

const FONT_NAME = "Syne";


// ------------------------------------------------------
// INITIAL POEM
// ------------------------------------------------------

const INITIAL_LINES = [
  "Baking sourdough when we are sad",
  "Making micro bangs when we are sad",
  "Saving menstrual blood when we are sad",
  "Not calling friends when we are sad",
  "Ordering from amazon when we are sad",
  "Fitting body into this dollhouse when we are sad",
  "Eating weights when we are sad",
  "Stripping the plastic from metal playground when we are sad",
  "Big feelings when we have a sweet tooth",
  "Pulling out hair when we are sad",
  "Sad when we need to sleep",
  "Sleep when we need to read for school",
  "Each carpet holds her dust until I clean them",
  "We are sad",
  "Coquet hook and a nibble of the loop not moving in the correct way when we are sad",
  "Screaming until lungs come up sad",
  "Collecting gemstones when we are sad",
  "Lipping a cappuccino when we are sad",
  "Going home to bathtub when we are sad",
  "Making a crown own of hair when we are sad",
  "An empty wallet when we are sad",
  "No sex when we are sad",
  "Blowing candles off birthday cake when we are sad",
  "A lot of sex when we are sad",
  "Sad when we are sad",
  "Iron torch to the throat sad",
  "Bus driver smiles when we are sad",
  "Slaying when we are sad",
  "Forage golden rod when we are sad",
  "Driving to Boston when we are sad",
  "The british are coming! The british are coming! When we are sad",
  "Spilt tea on jeans when we are sad",
  "Chinese lantern fly assault to torso when we are sad",
  "Two men call out hey sexy come here when we are sad",
  "Croatian sea shell noise when we are sad",
  "Mustard ice cubes on sandwiches when we are sad",
  "Cats smell of fresh bread when we are sad",
  "Using a grinder at the steele yard when we are sad",
  "Don’t text her back when we are sad"
];


// ------------------------------------------------------
// TYPOGRAPHY
// ------------------------------------------------------

const FONT_SIZE = 21;

const LETTER_SPACING_RATIO = 0.06;
const WORD_SPACING_EXTRA = 5;

const LINE_STEP = 42;

const MARGIN_X = 90;
const TOP_MARGIN = 115;


// ------------------------------------------------------
// INPUT
// ------------------------------------------------------

const MAX_CHARACTERS = 100;

const INPUT_HEIGHT = 86;
const INPUT_MARGIN_TOP = 55;

let currentInput = "";
let inputActive = false;

let cursorVisible = true;
let lastCursorBlink = 0;

const CURSOR_BLINK_SPEED = 500;


// ------------------------------------------------------
// NORMAL HAIR MOTION
// ------------------------------------------------------

const WIND_X = 7;
const WIND_Y = 3;

const WAVE_X = 3;
const WAVE_Y = 5;

// stronger left-side anchor
const ANCHOR_POWER = 2.5;


// ------------------------------------------------------
// HOVER / CURL
// ------------------------------------------------------

// 0.5 seconds
const HOVER_DELAY = 500;


// ------------------------------------------------------
// DATA
// ------------------------------------------------------

let poemLines = [];
let layoutReady = false;


// ------------------------------------------------------
// SETUP
// ------------------------------------------------------

function setup() {

  createCanvas(
    windowWidth,
    2600
  );

  textAlign(LEFT, TOP);

  document.fonts.ready.then(() => {

    textFont(FONT_NAME);

    INITIAL_LINES.forEach(
      txt => {
        poemLines.push(
          createPoemLine(txt)
        );
      }
    );

    updateCanvasHeight();

    layoutReady = true;
  });
}


// ------------------------------------------------------
// CREATE A LINE / STRAND
// ------------------------------------------------------

function createPoemLine(txt) {

  textSize(FONT_SIZE);
  textStyle(NORMAL);

  let glyphs = [];
  let x = 0;


  Array.from(txt).forEach(
    ch => {

      let w =
        textWidth(ch);


      glyphs.push({

        char: ch,

        offsetX: x,

        width: w
      });


      if (ch === " ") {

        x +=
          w +
          WORD_SPACING_EXTRA;

      } else {

        x +=
          w +
          w *
          LETTER_SPACING_RATIO;
      }
    }
  );


  return {

    text: txt,

    glyphs: glyphs,

    width: x,

    phase:
      random(TWO_PI),

    hoverStart:
      null,

    curlAmount:
      0,

    // -1 = up
    // +1 = down
    curlDirection:
      random() < 0.5
        ? -1
        : 1,

    // roughly one circular curl
    curlLoops:
      random(
        0.82,
        1.02
      ),

    // overall curl size
    curlRadius:
      random(
        55,
        85
      )
  };
}


// ------------------------------------------------------
// SMOOTH CURVE HELPER
// ------------------------------------------------------

function smoothStep01(v) {

  v =
    constrain(
      v,
      0,
      1
    );

  return (
    v *
    v *
    (
      3 -
      2 * v
    )
  );
}


// ------------------------------------------------------
// DRAW
// ------------------------------------------------------

function draw() {

  background(
    244,
    241,
    236
  );


  if (!layoutReady) {
    return;
  }


  drawTitle();

  updateHoverStates();

  drawPoem();

  drawInputBox();

  updateCursor();
}


// ------------------------------------------------------
// TITLE
// ------------------------------------------------------

function drawTitle() {

  textFont(FONT_NAME);

  textStyle(NORMAL);

  textSize(34);

  fill(20);

  noStroke();


  text(
    "Hair Crown",
    MARGIN_X,
    52
  );
}


// ------------------------------------------------------
// LINE Y POSITION
// ------------------------------------------------------

function getLineY(index) {

  return (
    TOP_MARGIN +
    index *
    LINE_STEP
  );
}


// ------------------------------------------------------
// DRAW POEM
// ------------------------------------------------------

function drawPoem() {

  let t =
    millis() *
    0.001;


  poemLines.forEach(
    (lineObj, lineIndex) => {

      let baseY =
        getLineY(lineIndex);


      let glyphCount =
        lineObj.glyphs.length;


      lineObj.glyphs.forEach(
        (glyph, glyphIndex) => {

          let linePos =

            glyphCount <= 1

              ? 0

              : glyphIndex /
                (glyphCount - 1);


          // ------------------------------------------
          // LEFT-SIDE ANCHOR
          // ------------------------------------------

          let anchorFactor =

            pow(
              linePos,
              ANCHOR_POWER
            );


          // ------------------------------------------
          // NORMAL WIND
          // ------------------------------------------

          let windX =

            (
              sin(
                t * 0.37 +
                lineObj.phase
              ) *
              WIND_X

              +

              sin(
                t * 0.17 +
                lineObj.phase * 1.8
              ) *
              WIND_X *
              0.55
            )

            *

            anchorFactor;


          let windY =

            (
              cos(
                t * 0.32 +
                lineObj.phase
              ) *
              WIND_Y

              +

              sin(
                t * 0.14 +
                lineObj.phase * 1.3
              ) *
              WIND_Y *
              0.5
            )

            *

            anchorFactor;


          // ------------------------------------------
          // SMALL TRAVELING WAVE
          // ------------------------------------------

          let waveX =

            sin(

              linePos * 7

              -

              t * 0.8

              +

              lineObj.phase

            )

            *

            WAVE_X

            *

            anchorFactor;


          let waveY =

            cos(

              linePos * 6

              -

              t * 0.7

              +

              lineObj.phase

            )

            *

            WAVE_Y

            *

            anchorFactor;


          // ------------------------------------------
          // WHOLE-LINE CIRCULAR CURL
          // ------------------------------------------

          // Entire line participates,
          // but the deformation increases
          // gradually from left to right.

          let curlProgress =

            pow(
              linePos,
              1.25
            );


          curlProgress =
            smoothStep01(
              curlProgress
            );


          // One circular loop
          let theta =

            curlProgress

            *

            TWO_PI

            *

            lineObj.curlLoops;


          // Radius grows from zero at the anchored end.
          // This is what makes the whole line act
          // like one connected flexible string.

          let radius =

            lineObj.curlRadius

            *

            curlProgress

            *

            lineObj.curlAmount;


          // Horizontal circular deformation
          let curlX =

            -radius

            *

            (
              1 -
              cos(theta)
            );


          // Vertical circular deformation
          let curlY =

            lineObj.curlDirection

            *

            radius

            *

            sin(theta);


          // ------------------------------------------
          // FINAL POSITION
          // ------------------------------------------

          let x =

            MARGIN_X

            +

            glyph.offsetX

            +

            windX

            +

            waveX

            +

            curlX;


          let y =

            baseY

            +

            windY

            +

            waveY

            +

            curlY;


          // ------------------------------------------
          // DRAW
          // ------------------------------------------

          textFont(
            FONT_NAME
          );

          textStyle(
            NORMAL
          );

          textSize(
            FONT_SIZE
          );

          fill(25);

          noStroke();


          text(
            glyph.char,
            x,
            y
          );
        }
      );
    }
  );
}


// ------------------------------------------------------
// HOVER DETECTION + CURL STATE
// ------------------------------------------------------

function updateHoverStates() {

  poemLines.forEach(
    (lineObj, index) => {

      let y =
        getLineY(index);


      let hovering =

        mouseX >=
        MARGIN_X - 15

        &&

        mouseX <=
        MARGIN_X +
        lineObj.width +
        30

        &&

        mouseY >=
        y - 14

        &&

        mouseY <=
        y +
        FONT_SIZE +
        18;


      // ------------------------------------------
      // HOVERING
      // ------------------------------------------

      if (hovering) {

        if (
          lineObj.hoverStart ===
          null
        ) {

          lineObj.hoverStart =
            millis();


          // randomize every new hover

          lineObj.curlDirection =

            random() < 0.5

              ? -1

              : 1;


          lineObj.curlLoops =

            random(
              0.82,
              1.02
            );


          lineObj.curlRadius =

            random(
              55,
              85
            );
        }


        let hoverDuration =

          millis()

          -

          lineObj.hoverStart;


        // begin after 0.5 sec
        if (
          hoverDuration >=
          HOVER_DELAY
        ) {

          lineObj.curlAmount =

            lerp(
              lineObj.curlAmount,
              1,
              0.055
            );
        }


      // ------------------------------------------
      // CURSOR LEAVES
      // ------------------------------------------

      } else {

        lineObj.hoverStart =
          null;


        // slowly relax
        lineObj.curlAmount =

          lerp(
            lineObj.curlAmount,
            0,
            0.015
          );
      }


      if (
        lineObj.curlAmount <
        0.001
      ) {

        lineObj.curlAmount =
          0;
      }
    }
  );
}


// ------------------------------------------------------
// INPUT POSITION
// ------------------------------------------------------

function getInputY() {

  return (

    TOP_MARGIN

    +

    poemLines.length *
    LINE_STEP

    +

    INPUT_MARGIN_TOP
  );
}


// ------------------------------------------------------
// DRAW INPUT BOX
// ------------------------------------------------------

function drawInputBox() {

  let y =
    getInputY();


  let boxWidth =
    min(
      width -
      MARGIN_X * 2,

      860
    );


  // BOX

  noFill();

  stroke(
    inputActive
      ? 25
      : 110
  );

  strokeWeight(
    inputActive
      ? 1.5
      : 1
  );


  rect(
    MARGIN_X,
    y,
    boxWidth,
    INPUT_HEIGHT,
    3
  );


  // LABEL

  noStroke();

  fill(105);

  textSize(11);

  textStyle(NORMAL);


  text(
    "WRITE A WAY YOU ARE SAD",
    MARGIN_X + 17,
    y + 12
  );


  // USER TEXT

  textSize(20);

  fill(25);


  let displayText =
    currentInput;


  if (
    inputActive &&
    cursorVisible
  ) {

    displayText += "_";
  }


  if (
    displayText.length === 0
  ) {

    fill(145);

    displayText =
      "click here and begin typing";
  }


  text(
    displayText,
    MARGIN_X + 17,
    y + 38,
    boxWidth - 34
  );


  // COUNT

  textAlign(
    RIGHT,
    TOP
  );

  textSize(10);

  fill(130);


  text(

    currentInput.length +
    " / " +
    MAX_CHARACTERS +
    "   ·   ENTER TO SUBMIT",

    MARGIN_X +
    boxWidth -
    15,

    y + 13
  );


  textAlign(
    LEFT,
    TOP
  );
}


// ------------------------------------------------------
// MOUSE CLICK
// ------------------------------------------------------

function mousePressed() {

  let y =
    getInputY();


  let boxWidth =
    min(
      width -
      MARGIN_X * 2,

      860
    );


  let insideInput =

    mouseX >=
    MARGIN_X

    &&

    mouseX <=
    MARGIN_X +
    boxWidth

    &&

    mouseY >=
    y

    &&

    mouseY <=
    y +
    INPUT_HEIGHT;


  inputActive =
    insideInput;


  if (
    inputActive
  ) {

    resetCursor();
  }
}


// ------------------------------------------------------
// NORMAL CHARACTER INPUT
// ------------------------------------------------------

function keyTyped() {

  if (
    !inputActive
  ) {

    return;
  }


  if (
    key.length === 1

    &&

    currentInput.length <
    MAX_CHARACTERS
  ) {

    currentInput +=
      key;


    resetCursor();
  }


  return false;
}


// ------------------------------------------------------
// SPECIAL KEYS
// ------------------------------------------------------

function keyPressed() {

  if (
    !inputActive
  ) {

    return;
  }


  // ENTER

  if (
    key === "Enter"

    ||

    keyCode === ENTER

    ||

    keyCode === RETURN
  ) {

    submitLine();

    return false;
  }


  // BACKSPACE

  if (
    key === "Backspace"
  ) {

    currentInput =

      currentInput.slice(
        0,
        -1
      );


    resetCursor();

    return false;
  }
}


// ------------------------------------------------------
// SUBMIT LINE
// ------------------------------------------------------

function submitLine() {

  let clean =
    currentInput.trim();


  if (
    clean.length === 0
  ) {

    return;
  }


  poemLines.push(

    createPoemLine(
      clean
    )
  );


  currentInput =
    "";


  resetCursor();


  updateCanvasHeight();


  setTimeout(
    () => {

      window.scrollTo({

        top:
          document.body.scrollHeight,

        behavior:
          "smooth"
      });

    },

    40
  );
}


// ------------------------------------------------------
// CANVAS HEIGHT
// ------------------------------------------------------

function updateCanvasHeight() {

  let desiredHeight =

    getInputY()

    +

    INPUT_HEIGHT

    +

    90;


  if (
    abs(
      height -
      desiredHeight
    ) >
    2
  ) {

    resizeCanvas(
      width,
      desiredHeight
    );
  }
}


// ------------------------------------------------------
// CURSOR
// ------------------------------------------------------

function updateCursor() {

  if (

    millis() -
    lastCursorBlink

    >

    CURSOR_BLINK_SPEED
  ) {

    cursorVisible =
      !cursorVisible;


    lastCursorBlink =
      millis();
  }
}


function resetCursor() {

  cursorVisible =
    true;


  lastCursorBlink =
    millis();
}