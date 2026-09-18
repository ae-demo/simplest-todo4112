import ballerina/os;

// todo-db (platform-resource, postgres-cnpg) — envBindings from design.json,
// verbatim. Empty when unset; db.bal supplies the runtime defaults so the
// service starts with no required environment variables.
configurable string todoDbHost = os:getEnv("TODO_DB_HOST");
configurable string todoDbPort = os:getEnv("TODO_DB_PORT");
configurable string todoDbUser = os:getEnv("TODO_DB_USER");
configurable string todoDbPassword = os:getEnv("TODO_DB_PASSWORD");
configurable string todoDbName = os:getEnv("TODO_DB_DBNAME");
