-- CreateTable
CREATE TABLE "Joke" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "joke" TEXT NOT NULL,
    "cheesiness" INTEGER NOT NULL,
    "predictability" INTEGER NOT NULL,
    "style" TEXT NOT NULL,
    "told" BOOLEAN NOT NULL DEFAULT false,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "eyeRollResponse" INTEGER NOT NULL DEFAULT 0,
    "groanResponse" INTEGER NOT NULL DEFAULT 0,
    "selfLaughResponse" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
