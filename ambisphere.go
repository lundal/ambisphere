package main

import (
	"flag"
	"log"
	"net/http"
	"strconv"

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

func main() {
	var port int
	var db string

	flag.IntVar(&port, "port", 4800, "Port to serve webinterface on")
	flag.StringVar(&db, "db", "ambisphere.db", "Database file")
	flag.Parse()

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
