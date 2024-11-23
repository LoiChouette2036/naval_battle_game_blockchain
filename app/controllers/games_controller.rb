class GamesController < ApplicationController
  before_action :authenticate_user! # Ensure user is logged in for all actions
  before_action :set_game, only: [:show, :place_ship, :attack]

  def index
    @games = Game.all
  end

  def show
    @game = Game.find(params[:id])
  end

  def new
    @game = Game.new
  end

  def create
    # create a new game and initialize it
    @game = Game.new(game_params)
    @game.creator = current_user
    @game.initialize_game(current_user, nil) # Ensure initialization
    
    if @game.save
      redirect_to @game, notice: "Game created! Waiting for an opponent to join"
    else
      render :new, alert: "Failed to create the game"
    end
  end

  def join
    @game = Game.find(params[:id])
  
    if @game.opponent.present?
      redirect_to @game, alert: "This game already has two players."
    else
      @game.join_game(current_user)
      redirect_to @game, notice: "You have successfully joined the game!"
    end
  end

  def place_ship
    if @game.phase != "placing_ships"
      render json: { success: false, error: "You cannot place ships in this phase!" }, status: :unprocessable_entity
      return
    end
    # Example params: {x: 0, y: 0, direction: "horizontal", size: 3}
    begin
      #Place the ship on the board
      @game.place_ship(current_user, params[:x].to_i, params[:y].to_i, params[:direction], params[:size].to_i)

      # Check if all ships are placed for this player
      if all_ships_placed?
        # If all ships are placed for both player, move to "attacking" phase
        if both_players_ready?
          @game.start_attacking
          message = "All ships placed! The game is now in the attacking phase."
        else
          message = "You have placed all your ships. Waiting for the other player to finish"
        end
      else
        message = "Ship placed successfully!"
      end

      render json: { success: true, message: message }     
    rescue => e
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  def attack
    if @game.phase != "attacking"
      render json: { success: false, error: "You cannot attack in this phase!" }, status: :unprocessable_entity
      return
    end

    begin
      # Perform the attack
      @game.attack(current_user, params[:x].to_i, params[:y].to_i)
      
      # Check if there's a winner
      if @game.winner?
        @game.complete_game
        render json: { success: true, message: "Attack successful! The game is over. Winner: #{@game.winner.username}" }
      else
        render json: { success: true, message: "Attack successful! It's now the other player's turn." }
      end
    rescue => e
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  private

  def all_ships_placed?
    board = current_user == @game.creator ? @game.player1_board : @game.player2_board
    ship_cells = board.flatten.count { |cell| cell == "S" }
    ship_cells == 17 # Total cells occupied by 5 ships: 5+4+3+3+2
  end

  def both_players_ready?
    player1_ready = @game.player1_board.flatten.count { |cell| cell == "S" } == 17
    player2_ready = @game.player2_board.flatten.count { |cell| cell == "S" } == 17
    player1_ready && player2_ready
  end  

  def set_game
    @game = Game.find(params[:id])
  end

  def game_params
    params.require(:game).permit(:bet_amount)
  end

end
