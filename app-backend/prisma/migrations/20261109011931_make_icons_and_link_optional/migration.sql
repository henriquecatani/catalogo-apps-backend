-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_App" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "link" TEXT,
    "small_description" TEXT NOT NULL,
    "markdown_description" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "category" TEXT NOT NULL DEFAULT 'General',
    "pricing" TEXT NOT NULL DEFAULT 'free',
    "developer_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "App_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "Developer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_App" ("category", "createdAt", "developer_id", "icon", "id", "link", "markdown_description", "name", "pricing", "rating", "small_description", "updatedAt") SELECT "category", "createdAt", "developer_id", "icon", "id", "link", "markdown_description", "name", "pricing", "rating", "small_description", "updatedAt" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
CREATE TABLE "new_Developer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Developer" ("createdAt", "icon", "id", "name", "updatedAt") SELECT "createdAt", "icon", "id", "name", "updatedAt" FROM "Developer";
DROP TABLE "Developer";
ALTER TABLE "new_Developer" RENAME TO "Developer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
