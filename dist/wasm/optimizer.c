#include <stdlib.h> // for rand(), srand() and RAND_MAX
#include <float.h> // for DBL_MAX
#include <math.h> // for pow()
#include <emscripten.h> // for EM_JS and EMSCRIPTEN_KEEPALIVE

EM_JS(void, onResults, (double fOpt, double xOpt, double yOpt, int iters, double err));

EMSCRIPTEN_KEEPALIVE
void run(int iters) {
    //srand(time(NULL));
    
    double bestX = 0.0;
    double bestY = 0.0;
    double best = DBL_MAX;
    const double xOpt = rand() / (double)RAND_MAX * 1000.0;
    const double yOpt = rand() / (double)RAND_MAX * 1000.0;
    const double fOpt = rand() / (double)RAND_MAX * 100.0;
    for(int i = 0; i < iters; i++) {
        const double x = rand() / (double)RAND_MAX * 1000.0;
        const double y = rand() / (double)RAND_MAX * 1000.0;
        const double f = pow(x - xOpt, 2) + pow(y - yOpt, 2) + fOpt;
        if(f < best) {
            best = f;
            bestX = x;
            bestY = y;
        }
    }
    const double err = (best - fOpt)/fOpt*100.0;
    onResults(best, bestX, bestY, iters, err);
}
