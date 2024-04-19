import Sketch from 'react-p5';
import * as ml5 from 'ml5';


function Screen() {

    //Varbiles 
    let shouldGenerate = false;
    let canvas;
    let clearButton;
    let saveButton;
    let viewSaveButton;
    // let words;
    let choice = 'cat';
    let sel;
    let model;
    let x;
    let y;
    let strokePath;
    let previousPen = 'down';
    let seedStrokes = [];
    let userStroke;
    let savedDrawings = [];


    function setup(p5, canvasParentRef) {

        canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
        canvas.position(0, 0);



        //background 
        p5.background(160);


        loadModel(choice, p5);


        sel = p5.createSelect();
        sel.option('cat');
        sel.option('dog');
        sel.option('bus');
        sel.changed(changeSel);
        sel.style('position:absolute');
        sel.style('left: 10%');
        sel.style('top: 30%');


        createButtons(p5);

        console.log(choice);
        createWords(p5);

    }


    function draw(p5) {

        if (p5.mouseIsPressed) {
            // Draw line
            p5.stroke(0);
            p5.strokeWeight(3.0);
            p5.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
            // Create a "stroke path" with dx, dy, and pen
            userStroke = {
                dx: p5.mouseX - p5.pmouseX,
                dy: p5.mouseY - p5.pmouseY,
                pen: 'down'
            };

            seedStrokes.push(userStroke);
            console.log(seedStrokes);
        }

        // If something new to draw
        if (shouldGenerate && strokePath) {
            if (previousPen === 'down') {
                p5.stroke(0);
                p5.strokeWeight(3.0);
                p5.line(x, y, x + strokePath.dx, y + strokePath.dy);
            }
            x += strokePath.dx;
            y += strokePath.dy;
            previousPen = strokePath.pen;

            if (strokePath.pen !== 'end') {
                strokePath = null;
                model.generate(gotStroke);
            }
        }
    }

    function loadModel(name, p5) {
        model = ml5.sketchRNN(name, modelReady(p5));
    }


    function startSketchRNN(p5) {
        //Start where mouse was last pressed
        x = p5.mouseX;
        y = p5.mouseY;

        //.generate(seed, callback)
        model.generate(seedStrokes, gotStroke);
    }

    // A new stroke path
    function gotStroke(err, s) {
        strokePath = s;
    }

    function modelReady(p5) {
        console.log('Model Ready');
        canvas.mouseReleased(() => {
            console.log('Model will Start');
            shouldGenerate = true; // Set flag to true when user starts drawing again
            startSketchRNN(p5);
        });
    }

    function setButtonStyles(button, styles) {
        const buttonElement = button.elt;
        Object.keys(styles).forEach(style => {
            buttonElement.style[style] = styles[style];
        });
    }

    function createButtons(p5) {
        const windowHeightRatio = p5.windowHeight / 100;
        const windowWidthRatio = p5.windowWidth / 100;

        const buttonHeight = 12 * windowHeightRatio; // Adjusted button height
        const buttonWidth = 25 * windowWidthRatio; // Adjusted button width

        const buttonSpacing = 5 * windowWidthRatio;

        // Small offset to the right
        const xOffset = 4 * windowWidthRatio;

        // Function to handle hover effect
        function handleHover(button) {
            button.style('background-color', 'rgba(100, 100, 100, 0.75)'); // Change background color on hover

        }

        // Function to handle hover end
        function handleHoverEnd(button) {
            button.style('background-color', 'rgba(80, 80, 80, 0.7)'); // Revert background color after hover
        }

        clearButton = p5.createButton('Clear');
        clearButton.position(buttonSpacing + xOffset, p5.windowHeight - buttonHeight - 20);
        setButtonStyles(clearButton, {
            'background-color': 'rgba(80, 80, 80, 0.7)',
            'border': 'none',
            'border-radius': '20px',
            'color': 'white',
            'padding': '20px 40px',
            'font-size': '35px',
            'width': `${buttonWidth}px`,
            'height': `${buttonHeight}px`,
        });
        clearButton.mousePressed(function () { clearDrawing(p5) });
        clearButton.mouseOver(function () { handleHover(clearButton); }); // Add hover effect
        clearButton.mouseOut(function () { handleHoverEnd(clearButton); }); // Revert hover effect

        saveButton = p5.createButton('Save');
        saveButton.mousePressed(function () { saveDrawing(p5) });
        saveButton.position(buttonWidth + 2 * buttonSpacing + xOffset, p5.windowHeight - buttonHeight - 20);
        setButtonStyles(saveButton, {
            'background-color': 'rgba(80, 80, 80, 0.7)',
            'border': 'none',
            'border-radius': '20px',
            'color': 'white',
            'padding': '20px 40px',
            'font-size': '35px',
            'width': `${buttonWidth}px`,
            'height': `${buttonHeight}px`,
        });
        saveButton.mouseOver(function () { handleHover(saveButton); }); // Add hover effect
        saveButton.mouseOut(function () { handleHoverEnd(saveButton); }); // Revert hover effect

        viewSaveButton = p5.createButton('View Saved');
        viewSaveButton.mousePressed(function () { viewSavedDrawings(p5) });
        viewSaveButton.position(2 * buttonWidth + 3 * buttonSpacing + xOffset, p5.windowHeight - buttonHeight - 20);
        setButtonStyles(viewSaveButton, {
            'background-color': 'rgba(80, 80, 80, 0.7)',
            'border': 'none',
            'border-radius': '20px',
            'color': 'white',
            'padding': '20px 40px',
            'font-size': '35px',
            'width': `${buttonWidth}px`,
            'height': `${buttonHeight}px`,
        });
        viewSaveButton.mouseOver(function () { handleHover(viewSaveButton); }); // Add hover effect
        viewSaveButton.mouseOut(function () { handleHoverEnd(viewSaveButton); }); // Revert hover effect
    }

    function saveDrawing(p5) {
        const timestamp = Date.now();
        const filename = `drawing_${timestamp}.png`;
        p5.saveCanvas(canvas, filename, 'png');

        savedDrawings.push(filename);
    }

    function viewSavedDrawings(p5) {
        // Clear the screen
        p5.background(160);

        const gridSize = 200; // Adjust as needed
        let xPos = 50; // Starting X position
        let yPos = 50; // Starting Y position

        // Display images in a grid
        for (var i = 0; i < savedDrawings.length; i++) {
            // Load each drawing
            const img = p5.loadImage(savedDrawings[i]);

            // Draw the image at the current position
            p5.image(img, xPos, yPos);

            // Move to the next position
            xPos += gridSize;

            // Check if the next position exceeds canvas width
            if (xPos + gridSize > p5.width) {
                xPos = 50; // Reset X position
                yPos += gridSize; // Move to the next row
            }
        }
    }

    function changeSel() {
        choice = sel.value();
    }


    function clearDrawing(p5) {
        p5.background(160);
        console.log('Cleared');
        createWords(p5);
        seedStrokes = [];
        model.reset();
        shouldGenerate = false; // Set flag to false when canvas is cleared
    }

    function createWords(p5) {
        p5.textSize(50);
        if (choice === undefined) { p5.text('Choose something to draw, then let A.I. finish it', p5.windowWidth * .1, p5.windowHeight * .1) } else { p5.text(`Begin drawing a ${choice}, then let A.I. finish it`, p5.windowWidth * .1, p5.windowHeight * .1); }

    }


    function windowResized(p5) {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        createButtons(p5);
    }

    return <Sketch setup={setup} draw={draw} windowResized={windowResized} />

}

export default Screen;

