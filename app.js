document.addEventListener('DOMContentLoaded', () => {
    const scoreDisplay = document.querySelector('#score')
    const startButton = document.querySelector('#start-button')
    const resetButton = document.querySelector('#reset-button')
    const powerUpButton = document.querySelector('#power-up-button');

    const grid = document.querySelector('.grid')
    const displayNextSquares = document.querySelectorAll('#next div')
    const displayHeldSquares = document.querySelectorAll('#hold div')

    const endContainer = document.querySelector('.end-container');
    const finalScoreText = document.querySelector('.final-score');
    const highScoreText = document.querySelector('.high-score');

    const displayWidth = 5
    const holdWidth = 5
    const maxWidth = 199
    const width = 10

    let displayIndex = 0
    let holdIndex = 0


    let squares = Array.from(document.querySelectorAll('.grid div'))

    let nextRandom = 0
    let heldPiece = 0

    let usedBonusTick = false
    let gameStarted = false
    let isPaused = true
    let holdLock = false
    let isHolding = false
    let stop = false
    let isGameOver = false

    let timerId
    let blurredTimerId
    let score = 0

    // The Modal
    const modal = document.getElementById('help-modal');
    const modalOpenBtn = document.getElementById('help-button');
    const modalCloseIcon = document.getElementById('close');

    // Local Storage
    const setToLS = (key, value) => {
        window.localStorage.setItem(key, JSON.stringify(value));
    };

    const getFromLS = key => {
        const value = window.localStorage.getItem(key);

        if (value) {
            return JSON.parse(value);
        }
    }

    /**
     * The Tetrominoes
     * [I] [O] [T] [J] [L] [S] [Z]
     */

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [2, width + 2, width * 2 + 2, width * 3 + 2],
        [width * 2, width * 2 + 1, width * 2 + 2, width * 2 + 3]
    ]

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ]

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ]

    const lTetromino = [
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width, width + 1, width + 2, width * 2],
        [1, 2, width + 2, width * 2 + 2],
        [width * 2, width * 2 + 1, width * 2 + 2, width + 2]
    ]

    const jTetromino = [
        [2, width + 2, width * 2 + 1, width * 2 + 2],
        [0, width, width + 1, width + 2],
        [0, 1, width, width * 2],
        [0, 1, 2, width + 2]

    ]

    const sTetromino = [
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1]
    ]

    const zTetromino = [
        [width, width + 1, width * 2 + 1, width * 2 + 2],
        [2, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width * 2 + 1, width * 2 + 2],
        [2, width + 1, width + 2, width * 2 + 1]
    ]

    const theTetrominoes = [iTetromino, oTetromino, tTetromino, lTetromino, jTetromino, sTetromino, zTetromino]
    const colors = ['cyan', 'yellow', 'orchid', 'orangered', 'blue', 'green', 'crimson']

    const upNextTetrominoes = [
        [2, displayWidth + 2, displayWidth * 2 + 2, displayWidth * 3 + 2], // i-tetromino
        [displayWidth + 1, displayWidth + 2, displayWidth * 2 + 1, displayWidth * 2 + 2], // o-tetromino
        [displayWidth + 2, displayWidth * 2 + 1, displayWidth * 2 + 2, displayWidth * 2 + 3], // t-tetromino
        [displayWidth + 2, displayWidth * 2 + 2, displayWidth * 3 + 2, displayWidth * 3 + 3], // l-tetromino
        [displayWidth + 3, displayWidth * 2 + 3, displayWidth * 3 + 2, displayWidth * 3 + 3], // j-tetromino
        [displayWidth * 2 + 1, displayWidth * 2 + 2, displayWidth + 2, displayWidth + 3], // s-tetromino
        [displayWidth + 1, displayWidth + 2, displayWidth * 2 + 2, displayWidth * 2 + 3] // z-tetromino
    ]

    const heldTetrominoes = [
        [2, holdWidth + 2, holdWidth * 2 + 2, holdWidth * 3 + 2], // i-tetromino
        [holdWidth + 1, holdWidth + 2, holdWidth * 2 + 1, holdWidth * 2 + 2], // o-tetromino
        [holdWidth + 2, holdWidth * 2 + 1, holdWidth * 2 + 2, holdWidth * 2 + 3], // t-tetromino
        [holdWidth + 2, holdWidth * 2 + 2, holdWidth * 3 + 2, holdWidth * 3 + 3], // l-tetromino
        [holdWidth + 3, holdWidth * 2 + 3, holdWidth * 3 + 2, holdWidth * 3 + 3], // j-tetromino
        [holdWidth * 2 + 1, holdWidth * 2 + 2, holdWidth + 2, holdWidth + 3], // s-tetromino
        [holdWidth + 1, holdWidth + 2, holdWidth * 2 + 2, holdWidth * 2 + 3] // z-tetromino
    ]

    let previewPosition
    let currentPosition = 4
    let currentRotation = 0

    let random = Math.floor(Math.random() * theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation]

    // Start button functionality
    startButton.addEventListener('click', () => {
        if (timerId) {
            pauseGame();
        } else if (!isGameOver) {
            playGame();
        }
    })

    function pauseGame() {
        isPaused = true;
        clearInterval(timerId);
        timerId = null;
        resetButton.disabled = false;
        startButton.innerHTML = "<i class=\"fas fa-play\"></i>Play";
    }

    function playGame() {
        resetButton.disabled = true;
        startButton.innerHTML = "<i class=\"fas fa-pause\"></i>Pause";
        startButton.blur();
        isPaused = false;
        draw();
        findAndDrawPreview();
        timerId = setInterval(moveDown, 1000);
        if (!gameStarted) {
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
            gameStarted = true;
        }
    }

    resetButton.addEventListener('click', () => {
        if (isPaused || isGameOver) {
            resetGame()
            resetButton.blur()
        } else {
            console.log('Pause game first')
        }
    })

    document.addEventListener('keyup', control)

    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    function drawPreview() {
        current.forEach(index => {
            squares[previewPosition + index].classList.add('tetromino-preview')
        })
    }

    function undrawPreview() {
        current.forEach(index => {
            squares[previewPosition + index].classList.remove('tetromino-preview')
        })
    }

    function findAndDrawPreview() {
        let previewLocationFound = false
        let i = 0
        while (!previewLocationFound) {
            previewPosition = currentPosition + i
            if (current.some(index => squares[previewPosition + index + width].classList.contains('frozen')) ||
                current.some(index => squares[previewPosition + index + width].classList.contains('floor'))) {
                current.forEach(index => squares[previewPosition + index].classList.add('tetromino-preview'))
                previewLocationFound = true
            } else if (previewPosition > maxWidth) {
                console.log("Error")
                break
            } else {
                i += width
            }
        }
    }

    function control(e) { // use website 'keycode.info' to find keyCode values
        if (!isPaused && !isGameOver) {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                rotateRight()
            } else if (e.code === 'KeyQ' || e.code === 'ShiftRight') {
                rotateLeft()
            } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                moveDown()
            } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                moveLeft()
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                moveRight()
            } else if (e.code === 'Space' || e.code === 'ControlRight') {
                drop()
            } else if (e.code === 'KeyC' || e.code === 'Enter') {
                hold()
            }
        }
    }

    function moveDown() {
        let overGround = current.some(index => squares[currentPosition + index + width].classList.contains('frozen')) || current.some(index => squares[currentPosition + index + width].classList.contains('floor'))
        undraw()
        if (!overGround) {
            currentPosition += width
        }
        draw()
        freeze()
    }

    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('frozen')) ||
            current.some(index => squares[currentPosition + index + width].classList.contains('floor'))) {
            if (usedBonusTick) {
                undrawPreview()
                score++
                scoreDisplay.innerHTML = score
                stop = true
                gameOver()

                current.forEach(index => squares[currentPosition + index].classList.add('frozen'))
                //start a new tetromino
                currentRotation = 0
                random = nextRandom
                nextRandom = Math.floor(Math.random() * theTetrominoes.length)
                current = theTetrominoes[random][currentRotation]
                currentPosition = 4
                holdLock = false
                checkRow()
                draw()
                findAndDrawPreview()
                displayShape()
            } else {
                usedBonusTick = true
            }
        } else if (usedBonusTick) {
            usedBonusTick = false
        }
    }

    function moveLeft() {
        undraw()
        undrawPreview()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if (!isAtLeftEdge) currentPosition -= 1

        if (current.some(index => squares[currentPosition + index].classList.contains('frozen'))) {
            currentPosition += 1
        }

        draw()
        findAndDrawPreview()
    }

    function moveRight() {
        undraw()
        undrawPreview()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

        if (!isAtRightEdge) currentPosition += 1

        if (current.some(index => squares[currentPosition + index].classList.contains('frozen'))) {
            currentPosition -= 1
        }

        draw()
        findAndDrawPreview()
    }

    function rotateRight() {
        undraw()
        undrawPreview()

        // check if current tetris piece is against one of the edges before rotation
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        currentRotation++
        if (currentRotation === current.length) {
            currentRotation = 0
        }

        current = theTetrominoes[random][currentRotation]

        // if current tetris piece was at right edge before rotating,
        // check if piece bled into next row after rotation
        // move piece left to correct rightward slide, repeat once if necessary (iTetromino piece will need 2 moves)
        if (isAtRightEdge) {
            if (current.some(index => (currentPosition + index) % width === 0)) {
                currentPosition -= 1
                if (current.some(index => (currentPosition + index) % width === 0)) {
                    currentPosition -= 1
                }
            }
        }

        // same as above, but on the other edge
        if (isAtLeftEdge) {
            if (current.some(index => (currentPosition + index) % width === width - 1)) {
                currentPosition += 1
                if (current.some(index => (currentPosition + index) % width === width - 1)) {
                    currentPosition += 1
                }
            }
        }

        draw()
        findAndDrawPreview()
    }

    function rotateLeft() {
        undraw()
        undrawPreview()

        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        currentRotation--
        if (currentRotation < 0) {
            currentRotation = current.length - 1
        }

        current = theTetrominoes[random][currentRotation]

        // if current tetris piece was at right edge before rotating,
        // check if piece bled into next row after rotation
        // move piece left to correct rightward slide, repeat once if necessary (iTetromino piece will need 2 moves)
        if (isAtRightEdge) {
            if (current.some(index => (currentPosition + index) % width === 0)) {
                currentPosition -= 1
                if (current.some(index => (currentPosition + index) % width === 0)) {
                    currentPosition -= 1
                }
            }
        }

        // same as above, but on the other edge
        if (isAtLeftEdge) {
            if (current.some(index => (currentPosition + index) % width === width - 1)) {
                currentPosition += 1
                if (current.some(index => (currentPosition + index) % width === width - 1)) {
                    currentPosition += 1
                }
            }
        }
        draw()
        findAndDrawPreview()
    }

    function hold() {
        // hold lock is set to true when a player uses the hold ability
        // hold lock is set to false when the game starts and when a piece is played

        if (!holdLock) {
            undraw()
            undrawPreview()
            displayHeldSquares.forEach(square => {
                square.classList.remove('tetromino')
                square.style.backgroundColor = ''
            })
            heldTetrominoes[random].forEach(index => {
                displayHeldSquares[holdIndex + index].classList.add('tetromino')
                displayHeldSquares[holdIndex + index].style.backgroundColor = colors[random]
            })

            if (!isHolding) {
                heldPiece = random
                random = nextRandom
                nextRandom = Math.floor(Math.random() * theTetrominoes.length)
                current = theTetrominoes[random][currentRotation]
                isHolding = true
                displayShape()
            } else {
                // if piece is being held, use the held piece
                current = theTetrominoes[heldPiece][currentRotation]
                let temp = random
                random = heldPiece
                heldPiece = temp
            }

            currentPosition = 4
            holdLock = true
            findAndDrawPreview()
            draw()
        }
    }

    function drop() {
        while (!stop) {
            moveDown()
            freeze()
        }

        stop = false
    }

    function displayShape() {
        // remove current tetromino
        displayNextSquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displayNextSquares[displayIndex + index].classList.add('tetromino')
            displayNextSquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }

    function checkRow() {
        let rowsFilled = 0

        for (let i = 0; i < maxWidth; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

            if (row.every(index => squares[index].classList.contains('frozen'))) {
                rowsFilled++
                row.forEach(index => {
                    squares[index].classList.remove('frozen')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }

        scoreRows(rowsFilled)
    }

    function scoreRows(rowsFilled) {
        if (rowsFilled === undefined) {
            rowsFilled = 0
        }

        score += 10 * rowsFilled
        if (rowsFilled === 4) {
            score += 10
        }

        scoreDisplay.innerHTML = score
    }

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('frozen')) && currentPosition < width) {
            // scoreDisplay.innerHTML = 'end'
            clearInterval(timerId)
            isGameOver = true
            gameStarted = false
            startButton.disabled = true
            resetButton.disabled = false
            // console.log(score);

            // Set the high score and final score
            finalScoreText.innerText = `Final Score: ${ score }`;

            // Set and Retrieve High Score
            if (getFromLS('high-score') < score) {
                setToLS('high-score', score);
                highScoreText.innerText = `New High Score!`;
            } else {
                highScoreText.innerText = `High Score: ${ getFromLS('high-score') }`;
            }




            // blur game and show the end container
            blurGrid();
            endContainer.style.opacity = 1;
            // call to some function that blurs screen and displays game over
        }
    }

    function resetGame() {
        // Hide the end container
        unblurGrid();
        endContainer.style.opacity = 0;

        squares.forEach(square => {
            square.classList.remove('frozen')
            square.classList.remove('tetromino')
            square.classList.remove('tetromino-preview')
            square.style.backgroundColor = ''
        })

        displayHeldSquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })

        isGameOver = false
        holdLock = false
        isHolding = false
        isPaused = true

        currentPosition = 4
        currentRotation = 0
        score = 0

        scoreDisplay.innerHTML = score
        startButton.innerHTML = "<i class=\"fas fa-play\"></i>Play";
        startButton.disabled = false
        resetButton.disabled = true

        random = Math.floor(Math.random() * theTetrominoes.length)
        current = theTetrominoes[random][currentRotation]
        clearInterval(timerId)
        timerId = null
    }

    modalOpenBtn.onclick = function () {
        modal.style.display = "block";
        pauseGame();
        console.log('Modal is open');
    }

    modalCloseIcon.onclick = function () {
        modal.style.display = "none";
        console.log('Modal is closed')
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            console.log('Modal is closed');
        }
    }

    // Temporary onclick blurTest
    powerUpButton.onclick = function () {
        if (!blurredTimerId) {
            blurGrid();
            powerUpButton.blur();
            blurredTimerId = setInterval(unblurGrid, 30000); // run unblur in 30 sec
        }
    }

    function blurGrid() {
        grid.style.filter = 'blur(5px)';
        console.log('blur');
    }

    function unblurGrid() {
        grid.style.filter = 'blur(0px)';
        console.log('unblur');
        clearInterval(blurredTimerId);
        blurredTimerId = null;
    }

})