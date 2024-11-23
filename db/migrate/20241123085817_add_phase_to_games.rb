class AddPhaseToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :phase, :string, default: "placing_ships"
  end
end
