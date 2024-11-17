class CreateGames < ActiveRecord::Migration[7.1]
  def change
    create_table :games do |t|
      t.string :status
      t.decimal :bet_amount
      t.integer :creator_id
      t.integer :opponent_id
      t.integer :winner_id
      t.json :player1_board
      t.json :player2_board

      t.timestamps
    end
  end
end
