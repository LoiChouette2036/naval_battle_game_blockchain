ActiveRecord::Schema[7.1].define(version: 2024_11_17_090028) do
  create_table "games", force: :cascade do |t|
    t.string "status"
    t.decimal "bet_amount"
    t.integer "creator_id"
    t.integer "opponent_id"
    t.integer "winner_id"
    t.json "player1_board"
    t.json "player2_board"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "player1_guess_board"
    t.json "player2_guess_board"
    t.integer "current_player_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "username", null: false
    t.string "wallet_address", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
    t.index ["wallet_address"], name: "index_users_on_wallet_address", unique: true
  end

end
