#!/bin/bash

emcc main.c -O2 -sSTANDALONE_WASM -o main.wasm --no-entry
cp main.wasm ../public/wasm