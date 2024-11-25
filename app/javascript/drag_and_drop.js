document.addEventListener('DOMContentLoaded', () => {
    // Step 1: Generate an empty board
    const boardSize = 10; // 10x10 grid
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill('-')); // 2D array for debugging

    // Step 2: Render the board into the DOM
    const playerBoard = document.getElementById('player-board'); // Get container for board

    if (!playerBoard) {
        console.error('Player board container not found in DOM!');
        return; // Exit early if the container is missing
    }

    // Create the grid
    for (let x = 0; x < boardSize; x++) {
        const row = document.createElement('div'); // Create a row
        row.classList.add('row'); // Optional CSS class for styling rows

        for (let y = 0; y < boardSize; y++) {
            const cell = document.createElement('div'); // Create a cell
            cell.classList.add('cell'); // Add CSS class for styling
            cell.dataset.x = x; // Set row coordinate
            cell.dataset.y = y; // Set column coordinate
            cell.id = `cell-${x}-${y}`; // Unique ID for debugging

            // Append cell to row
            row.appendChild(cell);
        }

        // Append row to player board
        playerBoard.appendChild(row);
    }

    console.log('Board successfully generated.');

    const ships = document.querySelectorAll('.ship'); // Select all ships
    let draggedShip = null; // Track the currently dragged ship

    // event listener click to select a boat

    ships.forEach(ship => {
        ship.addEventListener('click', () => {
            // remove the 'selected' class from all ships
            ships.forEach(s=> s.classList.remove('selected'));

            // add the 'selected' class to the clicked ship
            ship.classList.add('selected');
            console.log(`${ship.dataset.name} is selected.`);
        });
    });

    // add keydown listener for spacebar to rotate the selected ship
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            const selectedShip = document.querySelector('.ship.selected');
            if (!selectedShip) {
                console.log('No ship is selected to rotate.');
                return;
            }

            // Toggle the direction (horizontal <=> vertical)
            const currentDirection = selectedShip.dataset.direction;
            const newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
            selectedShip.dataset.direction = newDirection;

            // Apply the rotation styles dynamically
            if (newDirection === 'vertical') {
                selectedShip.style.width = '40px'; // Match a single cell width
                selectedShip.style.height = `${parseInt(selectedShip.dataset.size) * 40}px`; // Adjust height
            } else {
                selectedShip.style.width = `${parseInt(selectedShip.dataset.size) * 40}px`; // Adjust width
                selectedShip.style.height = '40px'; // Match a single cell height
            }

            console.log(`Rotated ${selectedShip.dataset.name} to ${newDirection}.`);
        }
    });

    // Step 3: Initialize drag-and-drop for ships

    ships.forEach(ship => {
        ship.addEventListener('dragstart', (event) => {
            draggedShip = {
                name: ship.dataset.name,
                size: parseInt(ship.dataset.size),
                direction: ship.dataset.direction,
            };
            console.log(`Dragging: ${draggedShip.name}, size: ${draggedShip.size}, direction: ${draggedShip.direction}`);
            event.dataTransfer.setData('text/plain', JSON.stringify(draggedShip));
            event.dataTransfer.effectAllowed = 'move';
        });

        ship.addEventListener('dragend', () => {
            console.log(`Drag ended for: ${draggedShip.name}`);
            draggedShip = null; // Reset after drag ends
        });
    });

    // Add drag-and-drop events to board cells
    const boardCells = document.querySelectorAll('.cell'); // Select all cells

    boardCells.forEach(cell => {
        cell.addEventListener('dragover', (event) => {
            event.preventDefault(); // Allow dropping
            if (draggedShip) {
                highlightCells(cell, draggedShip, true); // Highlight target cells
            }
        });

        cell.addEventListener('dragleave', () => {
            if (draggedShip) {
                highlightCells(cell, draggedShip, false); // Remove highlight
            }
        });

        cell.addEventListener('drop', (event) => {
            event.preventDefault();
            const startCell = event.target; // Cell where the ship is dropped

            if (draggedShip) {
                const isPlaced = placeShipOnBoard(startCell, draggedShip);

                if (isPlaced) {
                    const shipElement = document.querySelector(`.ship[data-name="${draggedShip.name}"]`);
                    if (shipElement) shipElement.remove(); // Remove the ship after placement
                } else {
                    alert("Invalid placement! Ensure the ship fits and doesn't overlap.");
                }
            }
        });
    });

    // Highlight cells function
    function highlightCells(startCell, ship, highlight) {
        const x = parseInt(startCell.dataset.x); // Starting x-coordinate
        const y = parseInt(startCell.dataset.y); // Starting y-coordinate
        const size = ship.size; // Ship size
        const direction = ship.direction; // Direction

        for (let i = 0; i < size; i++) {
            const targetCellId = direction === 'horizontal'
                ? `cell-${x}-${y + i}` // horizontal placement
                : `cell-${x + i}-${y}`; // vertical placement

            const targetCell = document.getElementById(targetCellId);
            if (targetCell) {
                targetCell.style.backgroundColor = highlight ? 'rgba(70, 130, 180, 0.5)' : ''; // Highlight color
            }
        }
    }

    // Place ship on board function
    function placeShipOnBoard(startCell, ship) {
        const x = parseInt(startCell.dataset.x); // Starting x-coordinate
        const y = parseInt(startCell.dataset.y); // Starting y-coordinate
        const size = ship.size; // Ship size
        const direction = ship.direction; // Direction
        const occupiedCells = []; // Track occupied cells

        console.log(`Placing ship: ${ship.name}, size: ${ship.size}, direction: ${direction}`);

        // Validate ship fits within boundaries
        if (direction === 'horizontal' && y + size > 10) {
            console.log(`Invalid placement: Ship ${ship.name} exceeds the right boundary.`);
            return false;
        }
        if (direction === 'vertical' && x + size > 10) {
            console.log(`Invalid placement: Ship ${ship.name} exceeds the bottom boundary.`);
            return false;
        }

        // Check each cell the ship would occupy
        for (let i = 0; i < size; i++) {
            const targetCellId = direction === 'horizontal'
                ? `cell-${x}-${y + i}`
                : `cell-${x + i}-${y}`;

            const targetCell = document.getElementById(targetCellId);
            if (!targetCell || targetCell.classList.contains('ship')) {
                console.log(`Invalid placement: Cell ${targetCellId} is out of bounds or already occupied.`);
                return false;
            }

            occupiedCells.push(targetCell); // Add valid cells
        }

        // Mark the cells as occupied
        occupiedCells.forEach((cell,index) => {
            cell.classList.add('ship');
            console.log(`Marking cell ${cell.id} as occupied (part ${index + 1}/${size} of ${ship.name})`);
        });

        console.log(`Ship ${ship.name} placed successfully.`);
        return true; // Success
    }
});
