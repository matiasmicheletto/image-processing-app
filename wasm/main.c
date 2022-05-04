#include <math.h> // for pow()
#include <emscripten.h> // for EM_JS and EMSCRIPTEN_KEEPALIVE

EM_JS(void, onResults, (int offset, int length));

EMSCRIPTEN_KEEPALIVE
void sobel(int offset, int length, int width, int height) {

    onResults(0, 1);
}

EMSCRIPTEN_KEEPALIVE
void gauss(int offset, int length, int width, int height) {

    onResults(0, 1);
}
