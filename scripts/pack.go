package main

import (
	"io/ioutil"
	"log"
	"os"
	"strings"
)

func main() {
	if len(os.Args) < 4 {
		log.Fatal("Not enough arguments")
	}

	dir := os.Args[1]
	templateName := os.Args[2]
	constantName := os.Args[3]

	fs, err := ioutil.ReadDir(dir)
	if err != nil {
		log.Fatal("Could not read directory " + dir)
	}

	filesByName := make(map[string]string)

	for _, f := range fs {
		if f.IsDir() {
			continue
		}
		content, err := ioutil.ReadFile(dir + f.Name())
		if err != nil {
			log.Fatal("Could not read file " + f.Name())
		}
		filesByName[f.Name()] = string(content)
	}

	template := filesByName[templateName]
	if template == "" {
		log.Fatal("Could not find template " + templateName)
	}

	for name, content := range filesByName {
		template = strings.Replace(template, "{{"+name+"}}", content, -1)
	}

	out := []byte("package main\n\nconst " + constantName + " = `" + template + "`\n")

	ioutil.WriteFile("pack_"+constantName+".go", out, 0644)
}
