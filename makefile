tag=$(shell git describe --tags --exact 2> /dev/null)
commit=$(shell git rev-parse HEAD)
version=$(if $(tag),$(tag),$(commit))
now=$(shell date -Is)

ambisphere:
	go generate
	go install -ldflags "-X main.version=$(version) -X main.buildtime=$(now)"
