import ballerina/log;
import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

// Sensible defaults so the service starts with no required environment
// variables — an unset TODO_DB_* falls back to a local, unauthenticated
// Postgres rather than failing to build or start.
const string DEFAULT_DB_HOST = "localhost";
const int DEFAULT_DB_PORT = 5432;
const string DEFAULT_DB_USER = "postgres";
const string DEFAULT_DB_PASSWORD = "postgres";
const string DEFAULT_DB_NAME = "postgres";

function resolvedDbPort() returns int {
    if todoDbPort == "" {
        return DEFAULT_DB_PORT;
    }
    int|error parsed = int:fromString(todoDbPort);
    if parsed is error {
        return DEFAULT_DB_PORT;
    }
    return parsed;
}

// A todo-db that cannot be reached at startup does not stop the service —
// the same "verify/persist at request time, not at start" shape the
// gateway-assertion trio uses when it is unset. Every DB-backed handler
// answers a 500 through `requireDbClient()` until connectivity is restored,
// rather than the whole process failing to come up.
final postgresql:Client? todoDbClient = initTodoDbClient();

function initTodoDbClient() returns postgresql:Client? {
    sql:ConnectionPool pool = {connectionTimeout: 3};
    postgresql:Client|error dbClient = new (
        host = todoDbHost == "" ? DEFAULT_DB_HOST : todoDbHost,
        username = todoDbUser == "" ? DEFAULT_DB_USER : todoDbUser,
        password = todoDbPassword == "" ? DEFAULT_DB_PASSWORD : todoDbPassword,
        database = todoDbName == "" ? DEFAULT_DB_NAME : todoDbName,
        port = resolvedDbPort(),
        connectionPool = pool
    );
    if dbClient is error {
        log:printWarn("todo-db is not reachable at startup; every persistence call will fail until it is",
                'error = dbClient);
        return ();
    }
    error? tableResult = initTodosTable(dbClient);
    if tableResult is error {
        log:printWarn("could not ensure the todos table exists", 'error = tableResult);
    }
    return dbClient;
}

function initTodosTable(postgresql:Client dbClient) returns error? {
    sql:ParameterizedQuery createTable = `CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(36) PRIMARY KEY,
        text TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    sql:ExecutionResult _ = check dbClient->execute(createTable);
}

// The connected client, or an error a handler can propagate as a 500 — never
// a panic, since an unreachable todo-db is a runtime condition, not a
// startup one.
function requireDbClient() returns postgresql:Client|error {
    postgresql:Client? dbClient = todoDbClient;
    if dbClient is () {
        return error("todo-db is not reachable");
    }
    return dbClient;
}

// One row of the `todos` table, as the query aliases it back to camelCase.
type TodoRow record {|
    string id;
    string text;
    boolean done;
    string createdBy;
    time:Utc createdAt;
|};

// Every todo, newest first, one page at a time — plus the total row count the
// pagination envelope needs.
function listTodoRows(int pageLimit, int pageOffset) returns [TodoRow[], int]|error {
    postgresql:Client dbClient = check requireDbClient();
    int total = check dbClient->queryRow(`SELECT COUNT(*) FROM todos`);
    sql:ParameterizedQuery query = `SELECT id, text, done, created_by AS "createdBy", created_at AS "createdAt"
        FROM todos ORDER BY created_at DESC, id DESC LIMIT ${pageLimit} OFFSET ${pageOffset}`;
    stream<TodoRow, sql:Error?> rowStream = dbClient->query(query);
    TodoRow[] rows = [];
    check from TodoRow row in rowStream
        do {
            rows.push(row);
        };
    check rowStream.close();
    return [rows, total];
}

// Inserts a new todo, stamping `createdBy` from the verified gateway caller —
// never from the request body.
function insertTodo(string text, string createdBy) returns TodoRow|error {
    postgresql:Client dbClient = check requireDbClient();
    string id = uuid:createRandomUuid();
    time:Utc createdAt = time:utcNow();
    sql:ParameterizedQuery insert = `INSERT INTO todos (id, text, done, created_by, created_at)
        VALUES (${id}, ${text}, FALSE, ${createdBy}, ${createdAt})`;
    sql:ExecutionResult _ = check dbClient->execute(insert);
    return {id, text, done: false, createdBy, createdAt};
}

// Toggles `done`. Returns `()` when no row matches — a 404, never a 500.
function updateTodoDone(string todoId, boolean done) returns TodoRow|error? {
    postgresql:Client dbClient = check requireDbClient();
    sql:ParameterizedQuery update = `UPDATE todos SET done = ${done} WHERE id = ${todoId}`;
    sql:ExecutionResult result = check dbClient->execute(update);
    int? rowsAffected = result.affectedRowCount;
    if rowsAffected is () || rowsAffected == 0 {
        return ();
    }
    sql:ParameterizedQuery selectQuery = `SELECT id, text, done, created_by AS "createdBy", created_at AS "createdAt"
        FROM todos WHERE id = ${todoId}`;
    TodoRow row = check dbClient->queryRow(selectQuery);
    return row;
}

// Deletes a todo. `true` when a row was removed, `false` when none matched.
function deleteTodoRow(string todoId) returns boolean|error {
    postgresql:Client dbClient = check requireDbClient();
    sql:ParameterizedQuery deleteQuery = `DELETE FROM todos WHERE id = ${todoId}`;
    sql:ExecutionResult result = check dbClient->execute(deleteQuery);
    int? rowsAffected = result.affectedRowCount;
    return rowsAffected is int && rowsAffected > 0;
}
