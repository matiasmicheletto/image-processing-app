import {ones, sobelH, sobelV} from './kernels.js';

/// RGB matrix operators
const clamp = value => Math.max(0, Math.min(255, value));

const convolution = (input, width, height, kernel) => {
    const res = new Uint8ClampedArray(input.length);
    const kl = kernel.length; // Structuring element side length (assuming square)
    const n = Math.floor(kl/2); // Structuring element center
    
    for(let row = n; row < height - n; row++) {
        for(let col = n; col < width - n; col++) {
            const pindex = (row*width + col)*4;
            let acc = [0,0,0];
            for(let r2 = 0; r2 < kl; r2++) {
                for(let c2 = 0; c2 < kl; c2++) {
                    const nindex = ((row-n+r2)*width + (col-n+c2))*4;
                    //const y = 0.2126*input[nindex] + 0.7152*input[nindex+1] + 0.0722*input[nindex+2];
                    acc[0] += input[nindex]*kernel[r2][c2];
                    acc[1] += input[nindex+1]*kernel[r2][c2];
                    acc[2] += input[nindex+2]*kernel[r2][c2];
                }
            }
            res[pindex] = clamp(acc[0]/kl/kl);
            res[pindex+1] = clamp(acc[1]/kl/kl);
            res[pindex+2] = clamp(acc[2]/kl/kl);
            res[pindex+3] = 255;
        }
    }
   return res;
};

const gradientMag = (input1, input2) => {
    if(input1.length === input2.length){
        const res = new Uint8ClampedArray(input1.length);
        for(let i = 0; i < input1.length; i++)
            res[i] = clamp(Math.sqrt(input1[i]*input1[i] + input2[i]*input2[i]));
        return res;
    }else{
        return null;
    }    
};

// Filter equations
export const invert = {
    name: 'Invert colors',
    apply: (data, width, height) => new Promise(resolve => {            
        const res = new Uint8ClampedArray(data.length);
        for(let i = 0; i < data.length; i+=4){
            res[i] = 255-data[i];
            res[i+1] = 255-data[i+1];
            res[i+2] = 255-data[i+2];
            res[i+3] = data[i+3];
        }
        resolve(res);
    })
};

export const blur = {
    name: 'Blur',
    apply: (data, width, height) => new Promise(resolve => {                
        const res = convolution(data, width, height, ones);
        resolve(res);
    })
};

export const sobel = {
    name: 'Border detection',
    apply: (data, width, height) => new Promise(resolve => {        
        const gx = convolution(data, width, height, sobelH);
        const gy = convolution(data, width, height, sobelV);
        const res = gradientMag(gx, gy);
        resolve(res);
    })
};

