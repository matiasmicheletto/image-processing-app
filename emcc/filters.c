#include <math.h> // for pow()
#include <stdlib.h> // for malloc() and free()
#include <emscripten.h> // for EM_JS and EMSCRIPTEN_KEEPALIVE

// Callbacks
EM_JS(void, onAlloc, (unsigned char* offset, int length));
EM_JS(void, onResults, (unsigned char* offset));

// Memory operations
EMSCRIPTEN_KEEPALIVE
void alloc(int length) {
    unsigned char* ptr = (unsigned char*)malloc(length * sizeof(unsigned char));
    onAlloc(ptr, length);
}

EMSCRIPTEN_KEEPALIVE
void mfree(unsigned char* ptr) {
    free(ptr);
}

const char sobelH[5][5] = {
    {2, 2, 4, 2, 2},
    {1, 1, 2, 1, 1},
    {0, 0, 0, 0, 0},
    {-1, -1, -2, -1, -1},
    {-2, -2, -4, -2, -2}
};
const char sobelV[5][5] = {
    {2, 1, 0, -1, -2},
    {2, 1, 0, -1, -2},
    {4, 2, 0, -2, -4},
    {2, 1, 0, -1, -2},
    {2, 1, 0, -1, -2}
};
const char ones[5][5] = {
   {1, 1, 1, 1, 1},
   {1, 1, 1, 1, 1},
   {1, 1, 1, 1, 1},
   {1, 1, 1, 1, 1},
   {1, 1, 1, 1, 1}
};

unsigned char clamp(short value) {
    return value < 0 ? 0 : value > 255 ? 255 : value;
}

unsigned char* convolution(unsigned char* input, int width, int height, const char kernel[5][5]) {
    int n = 2;
    unsigned char* res = (unsigned char*)malloc(width*height*4*sizeof(unsigned char));
    for(int row = n; row < height - n; row++) {
        for(int col = n; col < width - n; col++) {
            int pindex = (row*width + col)*4;
            short accR = 0, accG = 0, accB = 0;
            for(int r2 = 0; r2 < 5; r2++) {
                for(int c2 = 0; c2 < 5; c2++) {
                    int nindex = ((row-n+r2)*width + (col-n+c2))*4;
                    //unsigned char y = 0.2126*input[nindex] + 0.7152*input[nindex+1] + 0.0722*input[nindex+2];
                    accR += (short)input[nindex]*(short)kernel[r2][c2];
                    accG += (short)input[nindex+1]*(short)kernel[r2][c2];
                    accB += (short)input[nindex+2]*(short)kernel[r2][c2];
                }
            }
            res[pindex] = clamp(accR/25);
            res[pindex+1] = clamp(accG/25);
            res[pindex+2] = clamp(accB/25);
            res[pindex+3] = 255;
        }
    }
   return res;
}

unsigned char* gradientMag(unsigned char* input1, unsigned char* input2, int len) {
    unsigned char* res = (unsigned char*)malloc(len*sizeof(unsigned char));
    for(int i = 0; i < len; i++) 
        res[i] = clamp(sqrt((short)input1[i]*(short)input1[i] + (short)input2[i]*(short)input2[i]));
    return res;
}

// Interface for the filters

EMSCRIPTEN_KEEPALIVE
void invert(unsigned char* ptr, int width, int height) {
    int len = width*height*4;
    for(int i = 0; i < len; i+=4) {
        ptr[i] = 255-ptr[i];
        ptr[i+1] = 255-ptr[i+1];
        ptr[i+2] = 255-ptr[i+2];
        ptr[i+3] = ptr[i+3];
    }
    onResults(ptr); // *ptr is freed after result is processed in JS side
}

EMSCRIPTEN_KEEPALIVE
void sobel(unsigned char* ptr, int width, int height) {
    unsigned char* gx = convolution(ptr, width, height, sobelH);
    unsigned char* gy = convolution(ptr, width, height, sobelV);
    unsigned char* res = gradientMag(gx, gy, width*height*4);
    free(gx);
    free(gy);
    onResults(res); // *res is freed after result is processed in JS side
    free(ptr);
}

EMSCRIPTEN_KEEPALIVE
void blur(unsigned char* ptr, int width, int height) {
    unsigned char* res = convolution(ptr, width, height, ones);
    onResults(res); // *res is freed after result is processed in JS side
    free(ptr);
}
