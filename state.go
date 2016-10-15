package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
)

var states = make(map[string]string)

func getState(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	if len(id) != 16 {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	state, ok := states[id]
	if !ok {
		http.Error(w, "Unknown ID", http.StatusNotFound)
		return
	}

	fmt.Fprint(w, state)
}

func putState(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
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

	body, _ := ioutil.ReadAll(r.Body)
	states[id] = string(body)

	fmt.Fprint(w, "OK")
}

func pollState(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	id := p.ByName("id")
	if len(id) != 16 {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	state, ok := states[id]
	if !ok {
		http.Error(w, "Unknown ID", http.StatusNotFound)
		return
	}

	body, _ := ioutil.ReadAll(r.Body)
	knownState := string(body)

	for i := 0; i < 300; i++ {
		if states[id] != knownState {
			fmt.Fprint(w, state)
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	fmt.Fprint(w, state)
}
