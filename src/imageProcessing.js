import * as jsFilters from './filters/js';
import * as wasmFilters from './filters/wasm';

const filters = {
    js: jsFilters,
    wasm: wasmFilters
};

const filterWrapper = (imageData, filterType, filterName) => new Promise((resolve, reject) => {
    const {data, width, height} = imageData;
    if(filterName in filters[filterType]){
        filters[filterType][filterName].apply(data, width, height)
        .then(resData => {
            const resImage = new ImageData(width, height);
            resImage.data.set(resData);
            resolve(resImage);
        });
    }else{
        reject(`Filter ${filterName} not found`);
    }
});


// Base64 operations
const base64ToImageData = base64 => {
    return new Promise( (resolve, reject) => {        
        const canvas = document.createElement('canvas');                
        const ctx = canvas.getContext('2d');
        const img = new Image();                
        const watchdog = setTimeout(()=>{
            reject("Timeout");
        }, 5000);
        img.onload = () => {
            clearTimeout(watchdog);
            const {width, height} = img;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, width, height);
            resolve(imageData);
        };
        img.src = base64;
    });
};

const imageDataToBase64 = imageData => {
    const canvas = document.createElement('canvas');    
    const {width, height} = imageData;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0, 0, 0, width, height);
    return canvas.toDataURL('image/png', 1.0);
};

const filter = (base64, type, name) => new Promise(resolve => {
    const start = Date.now();
    base64ToImageData(base64)
    .then(data => filterWrapper(data, type, name))    
    .then(result => {
        resolve({
            image: imageDataToBase64(result),
            elapsed: Date.now() - start
        });
    });    
});

export default filter;
export const filtersList = Object.keys(jsFilters).map(key => ({name: jsFilters[key].name, key}));