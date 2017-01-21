package main

import "strings"

//go:generate go-bindata -prefix assets assets

var index = ""
var edit = ""
var view = ""

func init() {
	index = loadIndex()
	edit = loadEdit()
	view = loadView()
}

func loadIndex() string {
	html := string(MustAsset("index.html"))

	return html
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
