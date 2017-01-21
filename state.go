package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func initDb(file string) {
	dbx, err := sql.Open("sqlite3", file)
	if err != nil {
		log.Fatal(err)
	}

	db = dbx // Workaround

	_, err = db.Exec("create table if not exists states (id string primary key, state string)")
	if err != nil {
		log.Fatal(err)
	}
}

func hasState(id string) bool {
	stmt, err := db.Prepare("select count(*) from states where id = ?")
	if err != nil {
		log.Print(err)
		return false
	}

	defer stmt.Close()

	var result int

	err = stmt.QueryRow(id).Scan(&result)
	if err != nil {
		log.Print(err)
		return false
	}

	return result > 0
}

func readState(id string) string {
	stmt, err := db.Prepare("select state from states where id = ?")
	if err != nil {
		log.Print(err)
		return ""
	}

	defer stmt.Close()

	var result string

	err = stmt.QueryRow(id).Scan(&result)
	if err != nil {
		log.Print(err)
		return ""
	}

	return result
}

func saveState(id string, state string) error {
	_, err := db.Exec("insert or replace into states (id, state) values (?, ?)", id, state)
	if err != nil {
		log.Print(err)
	}
	return err
}
