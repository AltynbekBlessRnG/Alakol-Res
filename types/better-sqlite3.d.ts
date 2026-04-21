declare module "better-sqlite3" {
  type Statement = {
    run: (...params: unknown[]) => unknown;
    get: (...params: unknown[]) => unknown;
    all: (...params: unknown[]) => unknown[];
  };

  type DatabaseInstance = {
    prepare: (sql: string) => Statement;
    exec: (sql: string) => void;
    pragma: (value: string) => void;
  };

  namespace Database {
    type Database = DatabaseInstance;
  }

  class Database {
    constructor(path: string);
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(value: string): void;
  }

  export = Database;
}
