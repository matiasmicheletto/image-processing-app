let allocCallback = null;
let resultCallback = null;

const imports = {
    env: {
        onAlloc: ptr => {
            console.log("Memory allocated at", ptr);
            allocCallback(ptr);
            allocCallback = null;
        },
        onResults: ptr => { 
            console.log("Results ready");
            resultCallback(ptr);
            resultCallback = null;
        }
    } 
};

let wasmInstance;
let ready = false;
fetch('wasm/filters.wasm').then(response => {
    response.arrayBuffer().then(bytes => {                   
        WebAssembly.instantiate(bytes, imports)
        .then(module => {                    
            wasmInstance = module.instance.exports;
            ready = true;
        })
    });
});

const allocAndRun = (data, width, height, filter) => new Promise((resolve, reject) => {
    // Request memory allocation on the WASM side, then run filter
    if(ready){
        allocCallback = ptr => {
            const mem = new Uint8Array(wasmInstance.memory.buffer, ptr, data.length);
            mem.set(data);
            resultCallback = ptr2 => {
                var buffer = new Uint8Array(wasmInstance.memory.buffer, ptr2, data.length);
                wasmInstance.mfree(ptr2);
                resolve(Array.from(buffer));
            };
            filter(ptr, width, height);
        }
        if(data.length < 8388608){
            console.log("Requesting memory:", data.length);
            wasmInstance.alloc(data.length);
        }else
            reject("Image too large! - "+data.length);
    }else{
        reject('Wasm not ready');
    }
});

export const invert = (data, width, height) => allocAndRun(data, width, height, wasmInstance.invert);
export const blur = (data, width, height) => allocAndRun(data, width, height, wasmInstance.blur);
export const sobel = (data, width, height) => allocAndRun(data, width, height, wasmInstance.sobel);
