// Kernels

const sobel3h = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
];
const sobel3v = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
];
const sobel5h = [
    [2, 2, 4, 2, 2],
    [1, 1, 2, 1, 1],
    [0, 0, 0, 0, 0],
    [-1, -1, -2, -1, -1],
    [-2, -2, -4, -2, -2]
];
const sobel5v = [
    [2, 1, 0, -1, -2],
    [2, 1, 0, -1, -2],
    [4, 2, 0, -2, -4],
    [2, 1, 0, -1, -2],
    [2, 1, 0, -1, -2]
];
const gse = [
    [0, 0, 1, 2, 1, 0, 0],
    [0, 3, 13, 22, 13, 3, 0],
    [1, 13, 59, 97, 59, 13, 1],
    [2, 22, 97, 159, 97, 22, 2],
    [1, 13, 59, 97, 59, 13, 1],
    [0, 3, 13, 22, 13, 3, 0],
    [0, 0, 1, 2, 1, 0, 0]
];
const ones7 = [
   [1, 1, 1, 1, 1, 1, 1],
   [1, 1, 1, 1, 1, 1, 1],
   [1, 1, 1, 1, 1, 1, 1],
   [1, 1, 1, 1, 1, 1, 1],
   [1, 1, 1, 1, 1, 1, 1],
   [1, 1, 1, 1, 1, 1, 1],
   [1, 1, 1, 1, 1, 1, 1]
];


/// RGB matrix operators
const clamp = value => Math.max(0, Math.min(255, value));

const convolution = (imageData, width, height, se) => {
    const res = new Uint8ClampedArray(imageData.length);
    const sel = se.length; // Structuring element side (assuming square)
    const n = Math.floor(sel/2);
    for(let row = n; row < height - n; row++)
        for(let col = n; col < width - n; col++)
        {
            const pindex = (row*width + col)*4;
            let acc = [0,0,0];
            for(let r2 = 0; r2 < sel; r2++){
                for(let c2 = 0; c2 < sel; c2++)
                {
                    const nindex = ((row-n+r2)*width + (col-n+c2))*4;
                    //const y = 0.2126*imageData[nindex] + 0.7152*imageData[nindex+1] + 0.0722*imageData[nindex+2];
                    acc[0] += imageData[nindex]*se[r2][c2];
                    acc[1] += imageData[nindex+1]*se[r2][c2];
                    acc[2] += imageData[nindex+2]*se[r2][c2];
                }
            }
            res[pindex] = clamp(acc[0]/sel/sel);
            res[pindex+1] = clamp(acc[1]/sel/sel);
            res[pindex+2] = clamp(acc[2]/sel/sel);
            res[pindex+3] = 255;
        }
   return res;
};

const gradientMag = (imageData1, imageData2) => {
    if(imageData1.length === imageData2.length){
        const res = new Uint8ClampedArray(imageData1.length);
        for(let i = 0; i < imageData1.length; i++)
            res[i] = clamp(Math.sqrt(imageData1[i]*imageData1[i] + imageData2[i]*imageData2[i]));
        return res;
    }else{
        return null;
    }    
};


// Image filters

const filters = {
    invert: imageData => new Promise(resolve => {
            const data = new Uint8ClampedArray(imageData.data.length);
            for(let i = 0; i < imageData.data.length; i+=4){
                data[i] = 255-imageData.data[i];
                data[i+1] = 255-imageData.data[i+1];
                data[i+2] = 255-imageData.data[i+2];
                data[i+3] = imageData.data[i+3];
            }
            const res = new ImageData(imageData.width, imageData.height);
            res.data.set(data);
            resolve(res);
        }),
    smooth: imageData => new Promise(resolve => {        
        const {width, height} = imageData;
        const data = convolution(imageData.data, width, height, ones7);
        const res = new ImageData(width, height);
        res.data.set(data);
        resolve(res);
    }),
    sobel: imageData => new Promise(resolve => {
        const {width, height} = imageData;
        const gx = convolution(imageData.data, width, height, sobel5h);
        const gy = convolution(imageData.data, width, height, sobel5v);
        const data = gradientMag(gx, gy);
        const res = new ImageData(width, height);
        res.data.set(data);
        resolve(res);
    }),
};



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


const filter = (base64, name) => new Promise(resolve => {
    const start = Date.now();
    base64ToImageData(base64)
    .then(filters[name])    
    .then(result => {
        resolve({
            image: imageDataToBase64(result),
            elapsed: Date.now() - start
        });
    });    
});

export default filter;

