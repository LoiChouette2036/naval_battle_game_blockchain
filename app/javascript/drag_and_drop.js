document.addEventListener('DOMContentLoaded', () => {
  const ships = document.querySelectorAll('.ship'); // Select all ships
  const boardCells = document.querySelectorAll('#player-board td'); // Select board cells
  let draggedShip = null;

  // Handle drag start for ships
  ships.forEach(ship => {
    ship.addEventListener('dragstart', (event) => {
      draggedShip = {
        id: ship.id,
        size: parseInt(ship.dataset.size), // Get ship size
        direction: ship.dataset.direction, // Get ship direction
        element: ship // Reference to the DOM element
      };
      event.dataTransfer.setData('text/plain', JSON.stringify(draggedShip));
      event.dataTransfer.effectAllowed = 'move';
      console.log(`Dragging ship: ${draggedShip.id}, size=${draggedShip.size}`);
    });
  });

  // Allow cells to accept drops
  boardCells.forEach(cell => {
    cell.addEventListener('dragover', (event) => {
      event.preventDefault(); // Necessary to allow dropping
      cell.classList.add('drag-over'); // Highlight cell during drag
    });

    cell.addEventListener('dragleave', () => {
      cell.classList.remove('drag-over'); // Remove highlight when leaving
    });

    // Handle drop event
    cell.addEventListener('drop', (event) => {
      event.preventDefault();
      cell.classList.remove('drag-over'); // Remove highlight

      if (!draggedShip) {
        console.error('No ship is being dragged!');
        return;
      }

      const x = parseInt(cell.dataset.x); // Get X coordinate
      const y = parseInt(cell.dataset.y); // Get Y coordinate
      console.log(`Dropping ship at: (${x}, ${y})`);

      // Backend game ID
      const gameId = document.querySelector('#player-board').dataset.gameId;

      // Send data to the backend
      fetch(`/games/${gameId}/place_ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          x: x,
          y: y,
          size: draggedShip.size,
          direction: draggedShip.direction
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Ship placed successfully:', data);

            // Visual feedback: mark the cells where the ship is placed
            for (let i = 0; i < draggedShip.size; i++) {
              const targetCellId = draggedShip.direction === 'horizontal'
                ? `cell-${x}-${y + i}` // Horizontal placement
                : `cell-${x + i}-${y}`; // Vertical placement

              const targetCell = document.getElementById(targetCellId);
              if (targetCell) {
                targetCell.classList.add('ship'); // Mark as occupied
              } else {
                console.error(`Target cell not found: ${targetCellId}`);
              }
            }

            // Remove the ship element from the UI
            draggedShip.element.remove();
            draggedShip = null; // Reset the dragged ship
          } else {
            alert(`Error placing ship: ${data.error}`);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  });
});
