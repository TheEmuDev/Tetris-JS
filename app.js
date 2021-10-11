document.addEventListener('DOMContentLoaded', () => {
    const scoreDisplay = document.querySelector('#score')
    const startButton = document.querySelector('#start-button')

    const grid = document.querySelector('.grid')
    const displayNextSquares = document.querySelectorAll('.mini-grid div')
    const displayHeldSquares = document.querySelectorAll('.hold-grid div')

    const displayWidth = 5
    const holdWidth = 5
    
    let displayIndex = 0
    let holdIndex = 0

    let squares = Array.from(document.querySelectorAll('.grid div'))
    
    const width = 10
    let nextRandom = 0
    let heldPiece = 0
    let holdLock = false
    let isHolding = false
    let stop = false

    let timerId
    let score = 0

    /**
     * The Tetrominoes
     * [I] [O] [T] [J] [L] [S] [Z]
     */

    const iTetromino = [
        [1, width+1,width*2+1,width*3+1],
        [width, width+1, width+2, width+3],
        [2, width+2,width*2+2,width*3+2],
        [width*2, width*2+1, width*2+2, width*2+3]
    ]

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ]

    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ]

    const lTetromino = [
        [1, width+1, width*2+1, width*2+2],
        [width, width+1, width+2, width*2],
        [1, 2, width+2, width*2+2],
        [width*2, width*2+1, width*2+2, width+2]
    ]

    const jTetromino = [
        [2, width+2, width*2+1, width*2+2],
        [0, width, width+1, width+2],
        [0, 1, width, width*2],
        [0, 1, 2, width+2]
        
    ]

    const sTetromino = [
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1]
    ]

    const zTetromino = [
        [width, width+1, width*2+1, width*2+2],
        [2, width+1, width+2, width*2+1],
        [width, width+1, width*2+1, width*2+2],
        [2, width+1, width+2, width*2+1]
    ]

    const theTetrominoes = [iTetromino, oTetromino, tTetromino, lTetromino, jTetromino, sTetromino, zTetromino]
    const colors = [ 'cyan', 'yellow', 'orchid', 'orangered', 'blue', 'green', 'crimson' ]

    const upNextTetrominoes = [
        [2, displayWidth+2,displayWidth*2+2,displayWidth*3+2],                   // i-tetromino
        [displayWidth+1, displayWidth+2, displayWidth*2+1, displayWidth*2+2],    // o-tetromino
        [displayWidth+2, displayWidth*2+1, displayWidth*2+2, displayWidth*2+3],  // t-tetromino
        [displayWidth+2, displayWidth*2+2, displayWidth*3+2, displayWidth*3+3],  // l-tetromino
        [displayWidth+3, displayWidth*2+3, displayWidth*3+2, displayWidth*3+3],  // j-tetromino
        [displayWidth*2+1, displayWidth*2+2, displayWidth+2, displayWidth+3],    // s-tetromino
        [displayWidth+1, displayWidth+2, displayWidth*2+2, displayWidth*2+3]     // z-tetromino
    ]

    const heldTetrominoes = [
        [2, holdWidth+2,holdWidth*2+2,holdWidth*3+2],                // i-tetromino
        [holdWidth+1, holdWidth+2, holdWidth*2+1, holdWidth*2+2],    // o-tetromino
        [holdWidth+2, holdWidth*2+1, holdWidth*2+2, holdWidth*2+3],  // t-tetromino
        [holdWidth+2, holdWidth*2+2, holdWidth*3+2, holdWidth*3+3],  // l-tetromino
        [holdWidth+3, holdWidth*2+3, holdWidth*3+2, holdWidth*3+3],  // j-tetromino
        [holdWidth*2+1, holdWidth*2+2, holdWidth+2, holdWidth+3],    // s-tetromino
        [holdWidth+1, holdWidth+2, holdWidth*2+2, holdWidth*2+3]     // z-tetromino
    ]


    let currentPosition = 4
    let currentRotation = 0

    let random = Math.floor(Math.random()*theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation]

    // Start button functionality
    startButton.addEventListener('click', () => {
        if(timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            draw()
            timerId = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random()*theTetrominoes.length)
            displayShape()
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

    function control(e) { // use website 'keycode.info' to find keyCode values
        if (e.keyCode === 87 || e.keyCode === 38) {         // 'W' or up arrow
            rotateRight()
        } else if (e.keyCode === 81) {                      // 'Q'
            rotateLeft()
        }else if (e.keyCode === 83 || e.keyCode === 40) {   // 'S' or down arrow
            moveDown()
        } else if(e.keyCode === 65 || e.keyCode === 37) {   // 'A' or left arrow
            moveLeft()
        } else if (e.keyCode === 68 || e.keyCode === 39) {  // 'D' or right arrow
            moveRight()
        } else if (e.keyCode === 32 || e.keyCode === 17) {  // Space or 'CTRL' (both of them)
            drop()
        } else if (e.keyCode === 67) {                      // 'C'
            hold()
        }
    }

    function moveDown() {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            stop = true
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            //start a new tetromino
            currentRotation = 0
            random = nextRandom
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            holdLock = false
            draw()
            displayShape()
            addScore()
            gameOver()
        }
    }

    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if(!isAtLeftEdge) currentPosition -= 1

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }

        draw()
    }

    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)

        if(!isAtRightEdge) currentPosition += 1

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
        }

        draw()
    }

    function rotateRight() {

        undraw()

        // check if current tetris piece is against one of the edges before rotation
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        currentRotation++
        if(currentRotation === current.length) {
            currentRotation = 0
        }

        current = theTetrominoes[random][currentRotation]

        // if current tetris piece was at right edge before rotating,
        // check if piece bled into next row after rotation
        // move piece left to correct rightward slide, repeat once if necessary (iTetromino piece will need 2 moves)
        if(isAtRightEdge) { 
            if(current.some(index => (currentPosition + index) % width === 0)) { 
                currentPosition -= 1 
                if(current.some(index => (currentPosition + index) % width === 0)) {
                    currentPosition -= 1
                }
            }
         }

         // same as above, but on the other edge
         if(isAtLeftEdge) {
             if(current.some(index => (currentPosition + index) % width === width -1)) {
                 currentPosition += 1
                 if(current.some(index => (currentPosition + index) % width === width -1)) {
                     currentPosition += 1
                 }
             }
         }
    }

    function rotateLeft() {
        undraw()

        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        currentRotation--
        if(currentRotation < 0) {
            currentRotation = current.length-1
        }

        current = theTetrominoes[random][currentRotation]

        // if current tetris piece was at right edge before rotating,
        // check if piece bled into next row after rotation
        // move piece left to correct rightward slide, repeat once if necessary (iTetromino piece will need 2 moves)
        if(isAtRightEdge) { 
            if(current.some(index => (currentPosition + index) % width === 0)) { 
                currentPosition -= 1 
                if(current.some(index => (currentPosition + index) % width === 0)) {
                    currentPosition -= 1
                }
            }
         }

         // same as above, but on the other edge
         if(isAtLeftEdge) {
             if(current.some(index => (currentPosition + index) % width === width -1)) {
                 currentPosition += 1
                 if(current.some(index => (currentPosition + index) % width === width -1)) {
                     currentPosition += 1
                 }
             }
         }
    }

    function hold() {
        // hold lock is set to true when a player uses the hold ability
        // hold lock is set to false when the game starts and when a piece is played

        if(!holdLock) {
            undraw()
            displayHeldSquares.forEach(square => {
                square.classList.remove('tetromino')
                square.style.backgroundColor = ''
            })
            heldTetrominoes[random].forEach(index => {
                displayHeldSquares[holdIndex + index].classList.add('tetromino')
                displayHeldSquares[holdIndex + index].style.backgroundColor = colors[random]
            })

            if(!isHolding) {
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

    function addScore() {
        for (let i=0; i < 199; i += width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

            if(row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                scoreDisplay.innerHTML = score
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end'
            clearInterval(timerId)
        }
    }
})