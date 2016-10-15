package main

var states = make(map[string]string)

func hasState(id string) bool {
	_, ok := states[id]
	return ok
}

func readState(id string) string {
	state, _ := states[id]
	return state
}

func saveState(id string, state string) {
	states[id] = state
}
