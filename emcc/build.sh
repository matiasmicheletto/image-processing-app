#!/bin/bash

emcc filters.c -O2 -sSTANDALONE_WASM -o filters.wasm --no-entry
cp filters.wasm ../public/wasm