#!/bin/bash

emcc optimizer.c -O2 -sSTANDALONE_WASM -o optimizer.wasm --no-entry