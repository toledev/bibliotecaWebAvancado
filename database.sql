PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Authors (
    Id INTEGER NOT NULL CONSTRAINT PK_Authors PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Nationality TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Members (
    Id INTEGER NOT NULL CONSTRAINT PK_Members PRIMARY KEY AUTOINCREMENT,
    FullName TEXT NOT NULL,
    Email TEXT NOT NULL,
    BirthDate TEXT NOT NULL,
    Status INTEGER NOT NULL,
    CONSTRAINT AK_Members_Email UNIQUE (Email)
);

CREATE TABLE IF NOT EXISTS Books (
    Id INTEGER NOT NULL CONSTRAINT PK_Books PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Isbn TEXT NOT NULL,
    PublishedYear INTEGER NOT NULL,
    Genre INTEGER NOT NULL,
    CopiesAvailable INTEGER NOT NULL,
    AuthorId INTEGER NOT NULL,
    CONSTRAINT FK_Books_Authors_AuthorId FOREIGN KEY (AuthorId) REFERENCES Authors (Id) ON DELETE RESTRICT,
    CONSTRAINT AK_Books_Isbn UNIQUE (Isbn)
);

CREATE TABLE IF NOT EXISTS Loans (
    Id INTEGER NOT NULL CONSTRAINT PK_Loans PRIMARY KEY AUTOINCREMENT,
    BookId INTEGER NOT NULL,
    MemberId INTEGER NOT NULL,
    LoanDate TEXT NOT NULL,
    DueDate TEXT NOT NULL,
    ReturnDate TEXT NULL,
    Status INTEGER NOT NULL,
    DailyFine TEXT NOT NULL,
    CONSTRAINT FK_Loans_Books_BookId FOREIGN KEY (BookId) REFERENCES Books (Id) ON DELETE RESTRICT,
    CONSTRAINT FK_Loans_Members_MemberId FOREIGN KEY (MemberId) REFERENCES Members (Id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS IX_Books_AuthorId ON Books (AuthorId);
CREATE INDEX IF NOT EXISTS IX_Loans_BookId ON Loans (BookId);
CREATE INDEX IF NOT EXISTS IX_Loans_MemberId ON Loans (MemberId);

INSERT OR IGNORE INTO Authors (Id, Name, Nationality) VALUES
    (1, 'Machado de Assis', 'Brasileira'),
    (2, 'Robert C. Martin', 'Americana');

INSERT OR IGNORE INTO Books (Id, Title, Isbn, PublishedYear, Genre, CopiesAvailable, AuthorId) VALUES
    (1, 'Dom Casmurro', '9788535910663', 1899, 1, 3, 1),
    (2, 'Clean Code', '9780132350884', 2008, 2, 2, 2);

INSERT OR IGNORE INTO Members (Id, FullName, Email, BirthDate, Status) VALUES
    (1, 'Ana Souza', 'ana.souza@email.com', '1998-05-12 00:00:00', 1),
    (2, 'Pedro Lima', 'pedro.lima@email.com', '2012-08-03 00:00:00', 1);
