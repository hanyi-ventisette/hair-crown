// ------------------------------------------------------
// HAIR CROWN
// vertical ponytail strand version
// whole-strand arc curl
// p5.js 2.x
// ------------------------------------------------------


// ------------------------------------------------------
// FONT
// ------------------------------------------------------

const FONT_NAME = "Lora";


// ------------------------------------------------------
// STRANDS
// ------------------------------------------------------

const INITIAL_STRANDS = [

  "Baking sourdough when we are sad ( Making micro bangs when we are sad ) Saving menstrual blood when we are sad ( Not calling friends when we are sad",

  "Ordering from amazon when we are sad ) Fitting body into this dollhouse when we are sad } Eating weights when we are sad ( Stripping the plastic from metal playground when we are sad",

  "Big feelings when we have a sweet tooth ( Pulling out hair when we are sad ) Sad when we need to sleep ( Sleep when we need to read for school",

  "Each carpet holds her dust until I clean them ) We are sad ( Screaming until lungs come up sad ) Collecting gemstones when we are sad",

  "Lipping a cappuccino when we are sad ( Going home to bathtub when we are sad ( Making a crown own of hair when we are sad ) An empty wallet when we are sad",

  "No sex when we are sad ) Blowing candles off birthday cake when we are sad ( A lot of sex when we are sad ) Sad when we are sad",

  "Iron torch to the throat sad ( Bus driver smiles when we are sad ( Slaying when we are sad ) Forage golden rod when we are sad ( Driving to Boston when we are sad",

  "The british are coming! The british are coming! When we are sad ) Spilt tea on jeans when we are sad ( Chinese lantern fly assault to torso when we are sad",

  "Two men call out hey sexy come here when we are sad ) Croatian sea shell noise when we are sad ( Mustard ice cubes on sandwiches when we are sad",

  "Cats smell of fresh bread when we are sad ) Using a grinder at the steel yard when we are sad } Don’t text her back when we are sad"

];


// ------------------------------------------------------
// TYPOGRAPHY
// ------------------------------------------------------

const FONT_SIZE = 18;

const LETTER_SPACING_RATIO = 0.06;
const WORD_SPACING_EXTRA = 6;

const VERTICAL_SPACING_SCALE = 1;


// ------------------------------------------------------
// CANVAS
// ------------------------------------------------------

const CANVAS_HEIGHT = 1900;


// ------------------------------------------------------
// PONYTAIL LAYOUT
// ------------------------------------------------------

const ROOT_Y = 75;

const ROOT_SPREAD = 180;

const FAN_SPREAD = 500;

const FAN_POWER = 2;


// ------------------------------------------------------
// TITLE
// ------------------------------------------------------

// Allows a final tiny optical correction if needed.
// Try +/- 5 or 10 later if Ashlee wants it shifted.
const TITLE_OPTICAL_OFFSET_X = 0;


// ------------------------------------------------------
// WIND
// ------------------------------------------------------

const WIND_X = 24;

const GUST_X = 14;

const RIPPLE_X = 8;

const RIPPLE_Y = 3;

const ANCHOR_POWER = 1.8;


// ------------------------------------------------------
// GROWTH CYCLE
// ------------------------------------------------------

const GROW_DURATION = 40000;

const HOLD_DURATION = 20000;

const RESET_PAUSE = 1200;

let cycleStartTime = 0;


// ------------------------------------------------------
// HOVER / WHOLE-STRAND CURL
// ------------------------------------------------------

const HOVER_DELAY = 400;


// The entire strand bends into a circular arc.
//
// PI = 180°
// 1.25 PI = 225°
//
// This is intentionally dramatic.

const CURL_ANGLE_MIN = Math.PI * 0.90;
const CURL_ANGLE_MAX = Math.PI * 1.30;


// ------------------------------------------------------
// INPUT
// ------------------------------------------------------

const MAX_CHARACTERS = 100;

const INPUT_WIDTH = 500;
const INPUT_HEIGHT = 82;

let currentInput = "";
let inputActive = false;

let cursorVisible = true;
let lastCursorBlink = 0;

const CURSOR_BLINK_SPEED = 500;


// ------------------------------------------------------
// DATA
// ------------------------------------------------------

let strands = [];

let layoutReady = false;


// ------------------------------------------------------
// SETUP
// ------------------------------------------------------

function setup() {

  createCanvas(
    windowWidth,
    CANVAS_HEIGHT
  );

  textAlign(
    LEFT,
    TOP
  );


  document.fonts.ready.then(() => {

    textFont(
      FONT_NAME
    );


    INITIAL_STRANDS.forEach(
      (txt, index) => {

        strands.push(
          createStrand(
            txt,
            index
          )
        );

      }
    );


    cycleStartTime =
      millis();


    layoutReady =
      true;
  });
}


// ------------------------------------------------------
// CREATE STRAND
// ------------------------------------------------------

function createStrand(
  txt,
  index
) {

  textSize(
    FONT_SIZE
  );

  textStyle(
    NORMAL
  );


  let glyphs = [];

  let distance =
    0;


  Array.from(txt).forEach(
    ch => {

      let w =
        textWidth(ch);


      glyphs.push({

        char:
          ch,

        offsetY:
          distance,

        width:
          w

      });


      let advance;


      if (
        ch === " "
      ) {

        advance =

          w +

          WORD_SPACING_EXTRA;

      } else {

        advance =

          w +

          w *
          LETTER_SPACING_RATIO;
      }


      distance +=

        advance *

        VERTICAL_SPACING_SCALE;

    }
  );


  let normalizedIndex =

    INITIAL_STRANDS.length <= 1

      ? 0

      : map(
          index,
          0,
          INITIAL_STRANDS.length - 1,
          -1,
          1
        );


  return {

    text:
      txt,

    glyphs:
      glyphs,

    length:
      distance,


    // ------------------------------------------
    // ROOT
    // ------------------------------------------

    rootOffset:

      normalizedIndex *

      ROOT_SPREAD *
      0.5,


    // ------------------------------------------
    // FAN
    // ------------------------------------------

    fanOffset:

      normalizedIndex *

      FAN_SPREAD *
      0.5,


    // ------------------------------------------
    // WIND
    // ------------------------------------------

    phase:
      random(TWO_PI),


    // ------------------------------------------
    // HOVER
    // ------------------------------------------

    hoverStart:
      null,

    curlAmount:
      0,


    // left or right
    curlDirection:

      random() < 0.5

        ? -1

        : 1,


    // slightly different curvature per interaction
    curlAngle:

      random(
        CURL_ANGLE_MIN,
        CURL_ANGLE_MAX
      )
  };
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


  if (
    !layoutReady
  ) {

    return;
  }


  let cycleState =
    getCycleState();


  drawTitle();

  updateHoverStates(
    cycleState.growth
  );

  drawStrands(
    cycleState
  );

  drawInputBox();

  updateCursor();
}


// ------------------------------------------------------
// VISUAL CENTER OF STRAND CLUSTER
// ------------------------------------------------------
//
// Instead of using width / 2,
// estimate the center of the ACTUAL text mass.
//
// Longer strands contribute more visual weight.
// Fan direction is also included.
//
// ------------------------------------------------------

function getStrandVisualCenterX() {

  if (
    strands.length === 0
  ) {

    return width * 0.5;
  }


  let weightedX =
    0;

  let totalWeight =
    0;


  strands.forEach(
    strand => {

      // Average of pow(t, FAN_POWER)
      // from t = 0 → 1
      //
      // = 1 / (FAN_POWER + 1)

      let averageFan =

        strand.fanOffset /

        (
          FAN_POWER +
          1
        );


      let strandCenterX =

        getRootX(
          strand
        )

        +

        averageFan;


      // Longer strand = more visual mass

      let weight =

        max(
          strand.length,
          1
        );


      weightedX +=

        strandCenterX *

        weight;


      totalWeight +=
        weight;
    }
  );


  return (

    weightedX /

    totalWeight

    +

    TITLE_OPTICAL_OFFSET_X
  );
}


// ------------------------------------------------------
// TITLE
// ------------------------------------------------------

function drawTitle() {

  textFont(
    FONT_NAME
  );

  textStyle(
    NORMAL
  );

  textSize(
    30
  );

  fill(20);

  noStroke();


  textAlign(
    CENTER,
    TOP
  );


  text(
    "HAIR CROWN",

    getStrandVisualCenterX(),

    ROOT_Y - 38
  );


  textAlign(
    LEFT,
    TOP
  );
}


// ------------------------------------------------------
// CYCLE STATE
// ------------------------------------------------------

function getCycleState() {

  let cycleLength =

    GROW_DURATION +

    HOLD_DURATION +

    RESET_PAUSE;


  let elapsed =

    (
      millis() -
      cycleStartTime
    )

    %

    cycleLength;


  // ------------------------------------------
  // GROW
  // ------------------------------------------

  if (
    elapsed <
    GROW_DURATION
  ) {

    return {

      growth:

        constrain(

          elapsed /
          GROW_DURATION,

          0,

          1
        ),

      holding:
        false,

      resetting:
        false
    };
  }


  // ------------------------------------------
  // HOLD
  // ------------------------------------------

  if (
    elapsed <
    GROW_DURATION +
    HOLD_DURATION
  ) {

    return {

      growth:
        1,

      holding:
        true,

      resetting:
        false
    };
  }


  // ------------------------------------------
  // RESET
  // ------------------------------------------

  return {

    growth:
      0,

    holding:
      false,

    resetting:
      true
  };
}


// ------------------------------------------------------
// ROOT X
// ------------------------------------------------------

function getRootX(
  strand
) {

  return (

    width *
    0.5

    +

    strand.rootOffset
  );
}


// ------------------------------------------------------
// BASE GLYPH POSITION
// ------------------------------------------------------

function getBaseGlyphPosition(
  strand,
  glyphIndex,
  time
) {

  let glyph =

    strand.glyphs[
      glyphIndex
    ];


  let glyphCount =

    strand.glyphs.length;


  let strandPos =

    glyphCount <= 1

      ? 0

      : glyphIndex /
        (
          glyphCount -
          1
        );


  // ------------------------------------------
  // ANCHOR
  // ------------------------------------------

  let anchorFactor =

    pow(
      strandPos,
      ANCHOR_POWER
    );


  // ------------------------------------------
  // PONYTAIL FAN
  // ------------------------------------------

  let fanAmount =

    pow(
      strandPos,
      FAN_POWER
    );


  let ponytailX =

    strand.fanOffset *

    fanAmount;


  // ------------------------------------------
  // WIND
  // ------------------------------------------

  let windX =

    (
      sin(

        time *
        0.42

        +

        strand.phase

        +

        strandPos *
        2.2

      )

      *

      WIND_X


      +


      sin(

        time *
        0.16

        +

        strand.phase *
        1.8

      )

      *

      GUST_X
    )

    *

    anchorFactor;


  // ------------------------------------------
  // RIPPLE
  // ------------------------------------------

  let rippleX =

    sin(

      strandPos *
      10

      -

      time *
      0.9

      +

      strand.phase

    )

    *

    RIPPLE_X

    *

    anchorFactor;


  let rippleY =

    cos(

      strandPos *
      7

      -

      time *
      0.75

      +

      strand.phase

    )

    *

    RIPPLE_Y

    *

    anchorFactor;


  return {

    x:

      getRootX(
        strand
      )

      +

      ponytailX

      +

      windX

      +

      rippleX,


    y:

      ROOT_Y

      +

      glyph.offsetY

      +

      rippleY
  };
}


// ------------------------------------------------------
// WHOLE-STRAND ARC CURL
// ------------------------------------------------------
//
// This is the important new behavior.
//
// Instead of adding a random offset to each glyph,
// the entire text strand is mapped onto one circular arc.
//
// Because:
//
// radius * angle = arc length
//
// the distance along the path stays proportional
// to the original text spacing.
//
// ------------------------------------------------------

function getCurlOffset(
  strand,
  glyph,
  visibleLength
) {

  if (
    strand.curlAmount <
    0.0001
  ) {

    return {
      x: 0,
      y: 0
    };
  }


  let distanceAlongStrand =

    glyph.offsetY;


  visibleLength =

    max(
      visibleLength,
      1
    );


  let fullAngle =

    strand.curlAngle *

    strand.curlAmount;


  let absAngle =

    abs(
      fullAngle
    );


  if (
    absAngle <
    0.001
  ) {

    return {
      x: 0,
      y: 0
    };
  }


  // Radius chosen so total visible strand length
  // corresponds to the desired total arc angle.

  let radius =

    visibleLength /

    absAngle;


  // Arc angle for this glyph

  let theta =

    (
      distanceAlongStrand /
      visibleLength
    )

    *

    absAngle;


  theta =

    constrain(
      theta,
      0,
      absAngle
    );


  // Circular arc beginning vertically downward.

  let arcX =

    strand.curlDirection

    *

    radius

    *

    (
      1 -
      cos(theta)
    );


  let arcY =

    radius *

    sin(theta);


  // Original straight position was:
  //
  // x = 0
  // y = distanceAlongStrand
  //
  // Return only the DIFFERENCE.

  return {

    x:
      arcX,

    y:

      arcY -

      distanceAlongStrand
  };
}


// ------------------------------------------------------
// DRAW STRANDS
// ------------------------------------------------------

function drawStrands(
  cycleState
) {

  let growth =

    cycleState.growth;


  let t =

    millis() *
    0.001;


  strands.forEach(
    strand => {

      let glyphCount =

        strand.glyphs.length;


      // Visible physical length of this strand

      let visibleLength =

        strand.length *

        growth;


      strand.glyphs.forEach(
        (glyph, glyphIndex) => {

          let glyphProgress =

            glyphCount <= 1

              ? 0

              : glyphIndex /
                (
                  glyphCount -
                  1
                );


          // ------------------------------------------
          // NOT YET GROWN
          // ------------------------------------------

          if (
            glyphProgress >
            growth
          ) {

            return;
          }


          let basePosition =

            getBaseGlyphPosition(

              strand,

              glyphIndex,

              t
            );


          // ------------------------------------------
          // OPACITY
          // ------------------------------------------

          let opacity;


          // IMPORTANT:
          //
          // Once fully grown,
          // force EVERY glyph to full opacity.
          //
          // This fixes the last few characters
          // staying pale/incomplete.

          if (
            growth >= 0.999
          ) {

            opacity =
              255;

          } else {

            let distanceBehindTip =

              growth -
              glyphProgress;


            opacity =

              constrain(

                map(

                  distanceBehindTip,

                  0,
                  0.025,

                  0,
                  255

                ),

                0,
                255
              );
          }


          // ------------------------------------------
          // WHOLE-STRAND CURL
          // ------------------------------------------

          let curl =

            getCurlOffset(

              strand,

              glyph,

              visibleLength
            );


          let x =

            basePosition.x

            +

            curl.x;


          let y =

            basePosition.y

            +

            curl.y;


          // ------------------------------------------
          // DRAW GLYPH
          // ------------------------------------------

          push();


          translate(
            x,
            y
          );


          // Same orientation as the strand
          rotate(
            HALF_PI
          );


          textFont(
            FONT_NAME
          );

          textStyle(
            NORMAL
          );

          textSize(
            FONT_SIZE
          );


          fill(
            20,
            opacity
          );


          noStroke();


          text(
            glyph.char,
            0,
            0
          );


          pop();

        }
      );

    }
  );
}


// ------------------------------------------------------
// HOVER
// ------------------------------------------------------

function updateHoverStates(
  growth
) {

  let t =

    millis() *
    0.001;


  strands.forEach(
    strand => {

      let hovering =
        false;


      let visibleCount =

        floor(

          strand.glyphs.length *

          growth
        );


      // ------------------------------------------
      // DETECT CURSOR AGAINST ORIGINAL STRAND PATH
      // ------------------------------------------
      //
      // This intentionally uses the uncurlled path.
      //
      // Otherwise the strand could curl away from
      // the cursor and immediately cancel itself.
      //
      // ------------------------------------------

      for (
        let i = 0;
        i < visibleCount;
        i += 3
      ) {

        let pos =

          getBaseGlyphPosition(

            strand,

            i,

            t
          );


        let cursorDistance =

          dist(

            mouseX,
            mouseY,

            pos.x,
            pos.y
          );


        if (
          cursorDistance <
          30
        ) {

          hovering =
            true;

          break;
        }
      }


      // ------------------------------------------
      // HOVERING
      // ------------------------------------------

      if (
        hovering
      ) {

        if (
          strand.hoverStart ===
          null
        ) {

          strand.hoverStart =
            millis();


          // Random left/right direction

          strand.curlDirection =

            random() < 0.5

              ? -1

              : 1;


          // Slightly random curl severity

          strand.curlAngle =

            random(

              CURL_ANGLE_MIN,

              CURL_ANGLE_MAX
            );
        }


        let duration =

          millis() -

          strand.hoverStart;


        if (
          duration >=
          HOVER_DELAY
        ) {

          // Faster / more dramatic response

          strand.curlAmount =

            lerp(

              strand.curlAmount,

              1,

              0.075
            );
        }


      // ------------------------------------------
      // LEAVE
      // ------------------------------------------

      } else {

        strand.hoverStart =
          null;


        // Slow relaxation

        strand.curlAmount =

          lerp(

            strand.curlAmount,

            0,

            0.010
          );
      }


      if (
        strand.curlAmount <
        0.001
      ) {

        strand.curlAmount =
          0;
      }

    }
  );
}


// ------------------------------------------------------
// INPUT BOX
// ------------------------------------------------------

function drawInputBox() {

  let boxWidth =

    min(

      INPUT_WIDTH,

      width - 90

    );


  let x =
    45;


  let y =

    height -

    INPUT_HEIGHT -

    35;


  // ------------------------------------------
  // BOX
  // ------------------------------------------

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

    x,

    y,

    boxWidth,

    INPUT_HEIGHT,

    3
  );


  // ------------------------------------------
  // LABEL
  // ------------------------------------------

  noStroke();

  fill(105);

  textSize(11);

  textStyle(NORMAL);


  text(

    "WRITE A WAY YOU ARE SAD",

    x + 17,

    y + 12
  );


  // ------------------------------------------
  // INPUT
  // ------------------------------------------

  let displayText =
    currentInput;


  if (
    inputActive &&
    cursorVisible
  ) {

    displayText +=
      "_";
  }


  if (
    displayText.length ===
    0
  ) {

    fill(145);

    displayText =
      "click here and begin typing";

  } else {

    fill(25);
  }


  textSize(18);


  text(

    displayText,

    x + 17,

    y + 38,

    boxWidth - 34
  );


  // ------------------------------------------
  // COUNTER
  // ------------------------------------------

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

    x +
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
// INPUT CLICK
// ------------------------------------------------------

function mousePressed() {

  let boxWidth =

    min(

      INPUT_WIDTH,

      width - 90

    );


  let x =
    45;


  let y =

    height -

    INPUT_HEIGHT -

    35;


  inputActive =

    mouseX >= x

    &&

    mouseX <=
    x + boxWidth

    &&

    mouseY >= y

    &&

    mouseY <=
    y + INPUT_HEIGHT;


  if (
    inputActive
  ) {

    resetCursor();
  }
}


// ------------------------------------------------------
// TYPE
// ------------------------------------------------------

function keyTyped() {

  if (
    !inputActive
  ) {

    return;
  }


  if (

    key.length ===
    1

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
// SUBMIT
// ------------------------------------------------------

function submitLine() {

  let clean =

    currentInput.trim();


  if (
    clean.length ===
    0
  ) {

    return;
  }


  let index =

    floor(

      random(
        strands.length
      )
    );


  let oldStrand =

    strands[
      index
    ];


  let newText =

    oldStrand.text

    +

    " { "

    +

    clean;


  let replacement =

    createStrand(

      newText,

      index
    );


  // Preserve spatial placement

  replacement.rootOffset =
    oldStrand.rootOffset;


  replacement.fanOffset =
    oldStrand.fanOffset;


  strands[index] =
    replacement;


  currentInput =
    "";


  resetCursor();
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
