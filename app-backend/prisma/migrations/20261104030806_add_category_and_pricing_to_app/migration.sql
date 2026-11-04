-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_App" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "link" TEXT NOT NULL,
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
INSERT INTO "new_App" ("createdAt", "developer_id", "icon", "id", "link", "markdown_description", "name", "rating", "small_description", "updatedAt") SELECT "createdAt", "developer_id", "icon", "id", "link", "markdown_description", "name", "rating", "small_description", "updatedAt" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
