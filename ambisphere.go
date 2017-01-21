package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/julienschmidt/httprouter"
)

//go:generate go-bindata -prefix assets assets

var edit = ""
var view = ""

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
	err := saveState(id, string(body))
	if err != nil {
		http.Error(w, err.Error(), 500)
	} else {
		fmt.Fprint(w, "OK")
	}
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

func init() {
	edit = loadEdit()
	view = loadView()
}

func loadEdit() string {
	html := string(MustAsset("edit.html"))
	css := string(MustAsset("edit.css"))
	js := string(MustAsset("edit.js"))

	html = strings.Replace(html, "@css", css, -1)
	html = strings.Replace(html, "@js", js, -1)

	return html
}

func loadView() string {
	html := string(MustAsset("view.html"))

	return html
}

func main() {
	var port int
	var db string

	flag.IntVar(&port, "port", 4800, "Port to serve webinterface on")
	flag.StringVar(&db, "db", "ambisphere.db", "Database file")
	flag.Parse()

	initDb(db)

	router := httprouter.New()

	router.GET("/new/", getNew)

	router.GET("/view/:id", validateID(getView))
	router.GET("/edit/:id", validateID(getEdit))

	router.GET("/api/state/:id", validateID(getState))
	router.PUT("/api/state/:id", validateID(limitBody(putState)))
	router.POST("/api/state/:id", validateID(limitBody(pollState)))

	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(port), router))
}
