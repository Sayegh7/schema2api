#!/usr/bin/env node
var fs = require("fs");
var lib = require("../lib/index.js");
var file = process.argv[2];
var content = fs.readFileSync("./" + file, "utf8");
lib(JSON.parse(content));
