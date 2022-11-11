# Tetris-JS
Tetris clone written in JavaScript 

## Recent Changes
- Scoring System is now calculated by multiplying the score base by one plus the current level
    - Base value is determined by the number of lines cleared at the time of scoring
        - base = 40 for 1 line cleared, 100 for 2 lines, 300 for 3 lines, and 1200 for 4 lines
    - Players start at level 1 with a tick rate of 800 ms
        - A player will level up when the lines cleared exceeds (current level x 10) + 10
        - The tick rate (t) is calculated with the following formula:
            - t = ((Base Tick Rate - ((currentLevel-1) x .0.007))^(currentLevel-1) x 1000)
            - Base Tick Rate is equal to the tick rate at level 1 (800 ms)
            - The output of the tick rate formula is in milliseconds, and any decimal remainder is dropped using Math.floor
- Local Highscore is saved, displayed during game over screen
- Visual updates to the UI
    - New Gameover Tile is displayed when game ends
    - New Icons on buttons
---
## In Progress
- UI overhaul
    - Button Icons, Fonts, Game Backdrop
    - Gameover Screen
    - Gameboard size and position
    - Level indicator, lines cleared counter
---
### Upcoming Features
- Local Highscore Leaderboard
- Timed and Marathon Game modes
- Local 2-Player Battle Tetris
    - Powerups
        - Add 1-4 rows of junk to opponent's board
        - Blur opponent's board for a duration
        - Reverse opponent's controls for a duration
        - Flip opponent's board upside-down for a duration
---
### Known Issues
- After dropping a tetronimo without using quick drop, the next tetronimo will require 2 quick drop inputs to quick drop
- The local Highscore is not stored correctly when using the Opera GX browser
