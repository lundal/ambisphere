package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

//go:generate go run scripts/pack.go edit/ edit.html edit
//go:generate go run scripts/pack.go view/ view.html view

func getNew(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := randString(16)

	// Collision prevention
	if _, ok := states[id]; ok {
		id = randString(16)
	}

	states[id] = `{"scenes":[],"stack":[]}`
	http.Redirect(w, r, "../edit/"+id, http.StatusFound)
}

func getView(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	if len(id) != 16 {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, ok := states[id]
	if !ok {
		http.Error(w, "Unknown ID", http.StatusNotFound)
		return
	}

	w.Write([]byte(strings.Replace(view, "@id", id, -1)))
}

func getEdit(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	if len(id) != 16 {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, ok := states[id]
	if !ok {
		http.Error(w, "Unknown ID", http.StatusNotFound)
		return
	}

	w.Write([]byte(strings.Replace(edit, "@id", id, -1)))
}

func main() {
	router := httprouter.New()

	router.GET("/new/", getNew)
	router.GET("/view/:id", getView)
	router.GET("/edit/:id", getEdit)

	router.GET("/api/state/:id", getState)
	router.PUT("/api/state/:id", putState)
	router.POST("/api/state/:id", pollState)

	log.Fatal(http.ListenAndServe(":4800", router))
}
