config.js:
	cp $@ config.js.dist

database.json:
	cp $@ database.json.dist

node_modules: package.json
	npm install
	touch $@

.PHONY: install
install: node_modules config.json database.json

.PHONY: start
start:
	node index.js
