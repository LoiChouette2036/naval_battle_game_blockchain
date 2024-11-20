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
    # Example params: {x: 0, y: 0, direction: "horizontal", size: 3}
    begin
      @game.place_ship(current_user, params[:x].to_i, params[:y].to_i, params[:direction], params[:size].to_i)
      render json: { success: true, message: "Ship placed successfully!" }
    rescue => e
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  def attack
    # Example params: {x: 1, y: 1}
    begin
      @game.attack(current_user, params[:x].to_i, params[:y].to_i)
      render json: { success: true, message: "Attack successful!" }
    rescue => e
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  private

  def set_game
    @game = Game.find(params[:id])
  end

  def game_params
    params.require(:game).permit(:bet_amount)
  end

end
