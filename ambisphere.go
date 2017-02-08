package main

import (
	"flag"
	"log"
	"net/http"
	"strconv"

	"os"

	"github.com/julienschmidt/httprouter"
)

func validateID(handler httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		id := p.ByName("id")
		if !hasState(id) {
			http.Error(w, "Unknown ID", http.StatusNotFound)
			return
		}
		handler(w, r, p)
	}
}

func limitBody(handler httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		// 100 KB
		if r.ContentLength > 102400 {
			http.Error(w, "Too much data", http.StatusRequestEntityTooLarge)
			return
		}
		handler(w, r, p)
	}
}

func run(port int, db string) {
	initDb(db)

	router := httprouter.New()

	router.GET("/", getIndex)
	router.GET("/new/", getNew)

	router.GET("/view/:id", validateID(getView))
	router.GET("/edit/:id", validateID(getEdit))

	router.GET("/api/state/:id", validateID(getState))
	router.PUT("/api/state/:id", validateID(limitBody(putState)))
	router.POST("/api/state/:id", validateID(limitBody(pollState)))

	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
}

var (
	version   string
	buildtime string
)

func main() {
	workdir, _ := os.Getwd()

	port := flag.Int("port", 4800, "Port to serve webinterface on")
	db := flag.String("db", "ambisphere.db", "Database file")
	flag.Parse()

	log.Println(`     _              _     _           _                   `)
	log.Println(`    / \   _ __ ___ | |__ (_)___ _ __ | |__   ___ _ __ ___ `)
	log.Println(`   / _ \ | '_ ' _ \| '_ \| / __| '_ \| '_ \ / _ \ '__/ _ \`)
	log.Println(`  / ___ \| | | | | | |_) | \__ \ |_) | | | |  __/ | |  __/`)
	log.Println(` /_/   \_\_| |_| |_|_.__/|_|___/ .__/|_| |_|\___|_|  \___|`)
	log.Println(`                               |_|                        `)
	log.Println("--------------------------------------------------------------------------------")
	log.Printf("Version: %s", version)
	log.Printf("Build Time: %s", buildtime)
	log.Printf("Work Dir: %s", workdir)
	log.Println("--------------------------------------------------------------------------------")
	log.Printf("Port: %d", *port)
	log.Printf("Database: %s", *db)
	log.Println("--------------------------------------------------------------------------------")

	run(*port, *db)
}
