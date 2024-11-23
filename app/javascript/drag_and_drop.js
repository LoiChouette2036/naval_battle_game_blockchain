document.addEventListener('DOMContentLoaded', () => {
  const ships = document.querySelectorAll('.ship'); // Select ships
  const boardCells = document.querySelectorAll('#player-board td'); // Select board cells

  let draggedShip = null;

  // Enable dragging for ships
  ships.forEach(ship => {
    ship.addEventListener('dragstart', (e) => {
      draggedShip = {
        size: parseInt(ship.dataset.size),
        direction: ship.dataset.direction,
      };
      console.log(`Dragging ship of size: ${draggedShip.size}, direction: ${draggedShip.direction}`);
    });

    ship.addEventListener('dragend', () => {
      console.log("Ship drag ended");
    });
  });

  // Function to validate placement before sending to backend
  function isPlacementValid(x, y, size, direction) {
    if (direction === "horizontal" && y + size > 10) {
      alert("Placement out of bounds horizontally.");
      return false;
    }
    if (direction === "vertical" && x + size > 10) {
      alert("Placement out of bounds vertically.");
      return false;
    }
    return true;
  }

  // Allow dropping on the board
  boardCells.forEach(cell => {
    cell.addEventListener('dragover', (e) => {
      e.preventDefault(); // Necessary to allow dropping
    });

    cell.addEventListener('drop', (e) => {
      e.preventDefault();

      if (!draggedShip) {
        console.error("No ship data available during drop");
        return;
      }

      const x = parseInt(e.target.dataset.x); // Get cell coordinates
      const y = parseInt(e.target.dataset.y);

      console.log(`Dropping ship at cell (${x}, ${y})`);

      // Validate placement
      if (!isPlacementValid(x, y, draggedShip.size, draggedShip.direction)) {
        console.error("Invalid ship placement.");
        return; // Stop if placement is invalid
      }

      const gameId = document.querySelector('#player-board').dataset.gameId;

      // Send placement to the backend
      fetch(`/games/${gameId}/place_ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          x: x,
          y: y,
          direction: draggedShip.direction,
          size: draggedShip.size,
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Ship placed successfully!');

            // Update board visually
            for (let i = 0; i < draggedShip.size; i++) {
              const targetCellId = draggedShip.direction === "horizontal"
                ? `cell-${x}-${y + i}` // Horizontal placement
                : `cell-${x + i}-${y}`; // Vertical placement

              const targetCell = document.getElementById(targetCellId);

              if (targetCell) {
                targetCell.classList.add('ship'); // Apply the 'ship' class
                console.log(`Applied 'ship' class to cell ID: ${targetCellId}`);
              } else {
                console.error(`Cell with ID ${targetCellId} not found.`);
              }
            }

            // Reset draggedShip after successful placement
            draggedShip = null;
          } else {
            alert(data.error || 'Failed to place the ship.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  });
});
