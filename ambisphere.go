package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/julienschmidt/httprouter"
)

//go:generate go run scripts/pack.go edit/ edit.html edit
//go:generate go run scripts/pack.go view/ view.html view

func getNew(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := randString(20)
	saveState(id, `{"scenes":[],"stack":[]}`)
	http.Redirect(w, r, "/edit/"+id, http.StatusFound)
}

func getView(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	w.Write([]byte(strings.Replace(view, "@id", id, -1)))
}

func getEdit(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	w.Write([]byte(strings.Replace(edit, "@id", id, -1)))
}

func getState(w http.ResponseWriter, _ *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	state := readState(id)
	fmt.Fprint(w, state)
}

func putState(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	id := p.ByName("id")

	body, _ := ioutil.ReadAll(r.Body)
	saveState(id, string(body))

	fmt.Fprint(w, "OK")
}

func pollState(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	state := readState(id)

	body, _ := ioutil.ReadAll(r.Body)
	knownState := string(body)

	for i := 0; i < 300; i++ {
		if readState(id) != knownState {
			fmt.Fprint(w, state)
			return
		}
		time.Sleep(100 * time.Millisecond)
	}

	fmt.Fprint(w, state)
}

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
	router := httprouter.New()

	router.GET("/new/", getNew)

	router.GET("/view/:id", validateID(getView))
	router.GET("/edit/:id", validateID(getEdit))

	router.GET("/api/state/:id", validateID(getState))
	router.PUT("/api/state/:id", validateID(limitBody(putState)))
	router.POST("/api/state/:id", validateID(limitBody(pollState)))

	log.Fatal(http.ListenAndServe(":4800", router))
}
