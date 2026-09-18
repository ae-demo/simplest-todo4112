import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@wso2/oxygen-ui";
import { Trash2 } from "@wso2/oxygen-ui-icons-react";
import { useEffect, useState, type JSX } from "react";
import { todoApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/todo-api";

type Todo = components["schemas"]["Todo"];

/**
 * The one screen this app has (wireframes.dsl: TodoList). Loads GET /todos,
 * behind the sign-in guard — the flow that walks it, "Manage shared todos",
 * carries a `role` line. Add is POST /todos, the per-row toggle is
 * PATCH /todos/{todoId}, delete is DELETE /todos/{todoId}.
 */
export function TodoListPage(): JSX.Element {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(): Promise<void> {
    setLoadError(null);
    const { data, error } = await todoApi.GET("/todos", {
      params: { query: { limit: 100, offset: 0 } },
    });
    if (error) {
      setLoadError(error.message);
      return;
    }
    setTodos(data.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleAdd(): Promise<void> {
    const text = newText.trim();
    if (!text) return;
    setAdding(true);
    setActionError(null);
    try {
      const { data, error } = await todoApi.POST("/todos", { body: { text } });
      if (error) {
        setActionError(error.message);
        return;
      }
      setTodos((prev) => [...(prev ?? []), data]);
      setNewText("");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(todo: Todo): Promise<void> {
    setBusyId(todo.id);
    setActionError(null);
    try {
      const { data, error } = await todoApi.PATCH("/todos/{todoId}", {
        params: { path: { todoId: todo.id } },
        body: { done: !todo.done },
      });
      if (error) {
        setActionError(error.message);
        return;
      }
      setTodos((prev) => (prev ?? []).map((t) => (t.id === data.id ? data : t)));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(todo: Todo): Promise<void> {
    setBusyId(todo.id);
    setActionError(null);
    try {
      const { error } = await todoApi.DELETE("/todos/{todoId}", {
        params: { path: { todoId: todo.id } },
      });
      if (error) {
        setActionError(error.message);
        return;
      }
      setTodos((prev) => (prev ?? []).filter((t) => t.id !== todo.id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Shared Todos</PageTitle.Header>
      </PageTitle>

      <Can op="POST /todos">
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} justifyContent="flex-end">
          <TextField
            fullWidth
            placeholder="Add a todo..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !adding) void handleAdd();
            }}
          />
          <Button
            variant="contained"
            disabled={newText.trim().length === 0 || adding}
            onClick={() => void handleAdd()}
          >
            Add
          </Button>
        </Stack>
      </Can>

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      {loadError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      ) : null}

      {todos === null && !loadError ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ListingTable.Container>
          <ListingTable>
            <ListingTable.Head>
              <ListingTable.Row>
                <ListingTable.Cell>Done</ListingTable.Cell>
                <ListingTable.Cell>Task</ListingTable.Cell>
                <ListingTable.Cell>Added by</ListingTable.Cell>
                <ListingTable.Cell>{""}</ListingTable.Cell>
              </ListingTable.Row>
            </ListingTable.Head>
            <ListingTable.Body>
              {(todos ?? []).map((todo) => (
                <ListingTable.Row key={todo.id}>
                  <ListingTable.Cell>
                    <Can op="PATCH /todos/{todoId}" fallback={<Checkbox checked={todo.done} disabled />}>
                      <Tooltip title={todo.done ? "Mark not done" : "Mark done"}>
                        <span>
                          <Checkbox
                            checked={todo.done}
                            disabled={busyId === todo.id}
                            onChange={() => void handleToggle(todo)}
                          />
                        </span>
                      </Tooltip>
                    </Can>
                  </ListingTable.Cell>
                  <ListingTable.Cell>
                    <Typography
                      variant="body2"
                      sx={todo.done ? { textDecoration: "line-through", color: "text.secondary" } : undefined}
                    >
                      {todo.text}
                    </Typography>
                  </ListingTable.Cell>
                  <ListingTable.Cell>{todo.createdBy}</ListingTable.Cell>
                  <ListingTable.Cell align="right">
                    <Can op="DELETE /todos/{todoId}">
                      <ListingTable.RowActions>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              disabled={busyId === todo.id}
                              onClick={() => void handleDelete(todo)}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </ListingTable.RowActions>
                    </Can>
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))}
              {todos !== null && todos.length === 0 ? (
                <ListingTable.Row>
                  <ListingTable.Cell colSpan={4}>
                    <ListingTable.EmptyState
                      title="No todos yet"
                      description="Add the first item on the shared list."
                    />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ) : null}
            </ListingTable.Body>
          </ListingTable>
        </ListingTable.Container>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Check a row to mark it done or not done. Use Delete to remove an item.
      </Typography>
    </PageContent>
  );
}
