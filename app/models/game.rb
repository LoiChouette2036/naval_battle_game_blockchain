class Game < ApplicationRecord
  # Associations
  belongs_to :creator, class_name: "User", optional: true
  belongs_to :opponent, class_name: "User", optional: true
  belongs_to :winner, class_name: "User", optional: true
 
  # Validations
  validates :bet_amount, numericality: { greater_than_or_equal_to: 0 }

  PHASES = %w[placing_ships attacking completed].freeze

  validates :phase, inclusion: { in: PHASES }

  # Transition to attacking phase
  def start_attacking
    update!(phase: "attacking") if phase == "placing_ships"
  end

  def complete_game
    update!(phase: "completed") if phase == "attacking"
  end

  # Initialize the game with boards and set the starting player
  def initialize_game(creator, opponent, bet_amount = 0)
    puts "Initializing game with bet amount: #{bet_amount.inspect}" # Debug output

    # Assign bet amount and log it
    self.bet_amount = bet_amount.to_d
    puts "Assigned bet amount: #{self.bet_amount.inspect}" # Confirm assignment

    # Initialize boards
    self.player1_board = Array.new(10) { Array.new(10, '-') }
    self.player2_board = Array.new(10) { Array.new(10, '-') }
    self.player1_guess_board = Array.new(10) { Array.new(10, '-') }
    self.player2_guess_board = Array.new(10) { Array.new(10, '-') }


    # Set game status and players
    self.status = "in_progress"
    self.creator = creator
    self.opponent = opponent
    self.current_player_id = creator.id if opponent.present? # Set the starting player only when opponent is present
    puts "Bet Amount after assignment: #{self.bet_amount.inspect}"

    # Save and debug
    self.save!
    puts "Game saved successfully: #{self.inspect}"
  end
   
   # Place a ship on the player's board
   def place_ship(player, x, y, direction, size)
    # Debugging information
    puts "Placing ship: player=#{player.id}, x=#{x}, y=#{y}, direction=#{direction}, size=#{size}"
    
    # Validate phase
    raise "Cannot place ships, phase is #{phase}" unless phase == "placing_ships"
    
    # Select the appropriate board based on the player
    board = player == creator ? player1_board : player2_board
  
    # Validate ship placement is within bounds
    raise "Ship placement is out of bounds" if direction == "horizontal" && (y + size > 10)
    raise "Ship placement is out of bounds" if direction == "vertical" && (x + size > 10)
  
    # Validate that no other ships occupy the space
    size.times do |i|
      cell = direction == "horizontal" ? board[x][y + i] : board[x + i][y]
      raise "Ship placement overlaps another ship" if cell != '-'
    end
  
    # Place the ship on the board
    case direction
    when "horizontal"
      size.times { |i| board[x][y + i] = 'S' }
    when "vertical"
      size.times { |i| board[x + i][y] = 'S' }
    end
  
    # Save the updated board
    player == creator ? self.player1_board = board : self.player2_board = board
    save!
   end
  


  def join_game(opponent)
    raise "Game already has two players" if self.opponent.present?
  
    self.opponent = opponent
    self.status = "in_progress" # Change status to in progress when the second player joins
    self.current_player_id ||= creator.id # Set the starting player to the creator
    self.save!
  end

  # Attack logic
  def attack(player, x, y)
    opponent_board = player == creator ? player2_board : player1_board
    guess_board = player == creator ? player1_guess_board : player2_guess_board

    # Validates the cell hasn't been attacked yet
    raise "Cell already attacked!" if %w[H M].include?(opponent_board[x][y])

    case opponent_board[x][y]
    when 'S'
      opponent_board[x][y] = 'H'
      guess_board[x][y] = 'H'
    when '-'
      opponent_board[x][y] = 'M'
      guess_board[x][y] = 'M'
    else
      raise "Invalid move: already attacked this position"
    end

    player == creator ? self.player2_board = opponent_board : self.player1_board = opponent_board
    player == creator ? self.player1_guess_board = guess_board : self.player2_guess_board = guess_board

    save

    winner? ? end_game : switch_turns
  end

  # Switch turns between players
  def switch_turns
    self.current_player_id = (current_player_id == creator.id ? opponent.id : creator.id)
    self.save
  end

  # Get the current player
  def current_player
    User.find_by(id: current_player_id) 
  end

  # Check if there's a winner
  def winner?
    player1_lost = player1_board.flatten.none? { |cell| cell == 'S' }
    player2_lost = player2_board.flatten.none? { |cell| cell == 'S' }

    if player1_lost
      self.winner = opponent
    elsif player2_lost
      self.winner = creator
    else
      return false
    end

    self.status = "completed"
    save
    true
  end

  # End the game
  def end_game
    self.status = "completed"
    save
  end

  private

  #Validate the ship placement
  def valid_ship_placement?(x, y, direction, size, board)
    # Out-of-Bounds Check
    if direction == "horizontal" && (y + size > 10)
      raise "Ship placement is out of bounds horizontally"
    elsif direction == "vertical" && (x + size > 10)
      raise "Ship placement is out of bounds vertically"
    end
  
    # Overlapping Check
    size.times do |i|
      cell = direction == "horizontal" ? board[x][y + i] : board[x + i][y]
      raise "Ship placement overlaps another ship" if cell != '-'
    end
  
    true
  end
  
  
end
