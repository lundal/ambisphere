package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/julienschmidt/httprouter"
)

func getIndex(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	w.Write([]byte(index))
}

func getNew(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := randString(20)
	if hasState(id) {
		http.Error(w, "id exists", http.StatusInternalServerError)
		return
	}
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprint(w, "OK")
}

func pollState(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	state := ""

	body, _ := ioutil.ReadAll(r.Body)
	knownState := string(body)

	for i := 0; i < 300; i++ {
		state = readState(id)
		if state != knownState {
			fmt.Fprint(w, state)
			return
		}
		time.Sleep(200 * time.Millisecond)
	}

	fmt.Fprint(w, state)
}
