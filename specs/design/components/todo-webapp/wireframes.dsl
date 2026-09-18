screen TodoList "The shared todo list everyone sees and edits"
  navbar "Todo"
  heading "Shared Todos"
  row
    input "Add a todo..."
    right
    button "Add" primary
  table "Done | Task | Added by | "
    row " | Buy milk | alice | "
    row "✓ | Book flights | bob | "
  text "Check a row to mark it done or not done. Use Delete to remove an item."

flow "Manage shared todos"
  role "Collaborator"
  description "A signed-in user adds, completes, and removes items on the one shared list"
  TodoList
