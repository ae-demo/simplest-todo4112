// The todo-api service, mocked. Whether an operation may be called at all is
// mock/authz/gateway.ts's answer, read from openapi.yaml — nothing here
// re-checks a scope. There is no `/me/` path in this contract: every
// operation reaches every row on the one shared list, so no request is
// resolved against a caller identity.
//
// State lives in this module's scope, not on any "server": a reload, a typed
// URL or a link that leaves the SPA re-runs this module and restores the
// seed rows below. Only in-app navigation carries a change forward — the
// same seed data every walk starts from.

import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/todo-api";

type Todo = components["schemas"]["Todo"];
type TodoCreate = components["schemas"]["TodoCreate"];
type TodoUpdate = components["schemas"]["TodoUpdate"];

// The wireframe's own seed rows (wireframes.dsl, TodoList table), so the
// walk's screen matches the rendered wireframe exactly.
let todos: Todo[] = [
  {
    id: "1",
    text: "Buy milk",
    done: false,
    createdBy: "alice",
    createdAt: "2026-09-15T09:00:00.000Z",
  },
  {
    id: "2",
    text: "Book flights",
    done: true,
    createdBy: "bob",
    createdAt: "2026-09-16T14:30:00.000Z",
  },
];
let nextId = 3;

export const handlers = [
  http.get("/api/todos", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const page = todos.slice(offset, offset + limit);
    return HttpResponse.json({
      count: todos.length,
      next: offset + limit < todos.length ? `/todos?limit=${limit}&offset=${offset + limit}` : null,
      previous: offset > 0 ? `/todos?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      data: page,
    });
  }),

  http.post("/api/todos", async ({ request }) => {
    const input = (await request.json()) as TodoCreate;
    if (!input?.text || input.text.trim().length === 0) {
      return HttpResponse.json(
        { code: 400, message: "Invalid todo text", description: "text must not be empty" },
        { status: 400 },
      );
    }
    const created: Todo = {
      id: String(nextId++),
      text: input.text,
      done: false,
      // The mock's own stand-in for "whoever is signed in right now" — this
      // contract has no /me/ path, so no request is resolved against an
      // identity; the created row still needs a plausible author.
      createdBy: "you",
      createdAt: new Date().toISOString(),
    };
    todos = [...todos, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/todos/:todoId", async ({ params, request }) => {
    const input = (await request.json()) as TodoUpdate;
    const index = todos.findIndex((t) => t.id === params.todoId);
    if (index === -1) {
      return HttpResponse.json({ code: 404, message: "Todo not found" }, { status: 404 });
    }
    const updated: Todo = { ...todos[index], done: input.done };
    todos = [...todos.slice(0, index), updated, ...todos.slice(index + 1)];
    return HttpResponse.json(updated);
  }),

  http.delete("/api/todos/:todoId", ({ params }) => {
    const before = todos.length;
    todos = todos.filter((t) => t.id !== params.todoId);
    return before === todos.length
      ? HttpResponse.json({ code: 404, message: "Todo not found" }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),
];
