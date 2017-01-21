package main

import (
	"math/rand"
	"time"
)

const randCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
}

func randString(length int) string {
	rnd := make([]byte, length)
	for i := range rnd {
		rnd[i] = randCharacters[rand.Intn(len(randCharacters))]
	}
	return string(rnd)
}
