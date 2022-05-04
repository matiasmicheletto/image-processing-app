import {ones7, sobel5h, sobel5v} from './kernels.js';

/// RGB matrix operators
const clamp = value => Math.max(0, Math.min(255, value));

const convolution = (matrixData, width, height, se) => {
    const res = new Uint8ClampedArray(matrixData.length);
    const sel = se.length; // Structuring element side length (assuming square)
    const n = Math.floor(sel/2); // Structuring element center
    
    for(let row = n; row < height - n; row++) {
        for(let col = n; col < width - n; col++) {
            const pindex = (row*width + col)*4;
            let acc = [0,0,0];
            for(let r2 = 0; r2 < sel; r2++) {
                for(let c2 = 0; c2 < sel; c2++) {
                    const nindex = ((row-n+r2)*width + (col-n+c2))*4;
                    //const y = 0.2126*matrixData[nindex] + 0.7152*matrixData[nindex+1] + 0.0722*matrixData[nindex+2];
                    acc[0] += matrixData[nindex]*se[r2][c2];
                    acc[1] += matrixData[nindex+1]*se[r2][c2];
                    acc[2] += matrixData[nindex+2]*se[r2][c2];
                }
            }
            res[pindex] = clamp(acc[0]/sel/sel);
            res[pindex+1] = clamp(acc[1]/sel/sel);
            res[pindex+2] = clamp(acc[2]/sel/sel);
            res[pindex+3] = 255;
        }
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

// Filter equations
export const invert = (data, width, height) => new Promise(resolve => {            
    const res = new Uint8ClampedArray(data.length);
    for(let i = 0; i < data.length; i+=4){
        res[i] = 255-data[i];
        res[i+1] = 255-data[i+1];
        res[i+2] = 255-data[i+2];
        res[i+3] = data[i+3];
    }
    resolve(res);
});

export const smooth = (data, width, height) => new Promise(resolve => {                
    const res = convolution(data, width, height, ones7);
    resolve(res);
});

export const sobel = (data, width, height) => new Promise(resolve => {        
    const gx = convolution(data, width, height, sobel5h);
    const gy = convolution(data, width, height, sobel5v);
    const res = gradientMag(gx, gy);
    resolve(res);
});