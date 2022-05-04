const imports = {
    env: {
        // This callback will be called from the C++ side when the wasm module returns the results
        onResults: (offset, length) => { 
            const res = new Uint8ClampedArray(length);
            const view = new Uint8Array(memory.buffer, offset, length);
            for(let i = 0; i < length; i++)
                res[i] = view[i];
            window.dispatchEvent(new CustomEvent('onResult', {data: res}));
        }
    } 
};

let wasmInstance;
fetch('wasm/main.wasm').then(response => {
    response.arrayBuffer().then(bytes => {                   
        WebAssembly.instantiate(bytes, imports)
        .then(module => {                    
            wasmInstance = module.instance.exports;
            console.log(wasmInstance);
        })
    });
});



export const invert = (data, width, height) => new Promise(resolve => {            
    wasmInstance.invert(data, width, height);
    window.addEventListener('onResult', e => {
        resolve(e.data);
    });
});

export const smooth = (data, width, height) => new Promise(resolve => {                
    
});

export const sobel = (data, width, height) => new Promise(resolve => {        
    
});