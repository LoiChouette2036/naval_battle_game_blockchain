class AddGuessBoardsToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :player1_guess_board, :json
    add_column :games, :player2_guess_board, :json
  end
end
