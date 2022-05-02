
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


const invertRGB = imageData => {
    const res = new Uint8ClampedArray(imageData.length);
    for(let i = 0; i < imageData.length; i+=4){
         res[i] = 255-imageData[i];
         res[i+1] = 255-imageData[i+1];
         res[i+2] = 255-imageData[i+2];
         res[i+3] = imageData[i+3];
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


// Special filters

const smoothing = (imageData, width, height) => {
    /*
    const gse = [
        [0, 0, 1, 2, 1, 0, 0],
        [0, 3, 13, 22, 13, 3, 0],
        [1, 13, 59, 97, 59, 13, 1],
        [2, 22, 97, 159, 97, 22, 2],
        [1, 13, 59, 97, 59, 13, 1],
        [0, 3, 13, 22, 13, 3, 0],
        [0, 0, 1, 2, 1, 0, 0]
    ];
    */
   const se = [
       [1, 1, 1, 1, 1, 1, 1],
       [1, 1, 1, 1, 1, 1, 1],
       [1, 1, 1, 1, 1, 1, 1],
       [1, 1, 1, 1, 1, 1, 1],
       [1, 1, 1, 1, 1, 1, 1],
       [1, 1, 1, 1, 1, 1, 1],
       [1, 1, 1, 1, 1, 1, 1]
    ];
    return convolution(imageData, width, height, se);
};

const sobel = (imageData, width, height) => {
    const seh = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const gx = convolution(imageData, width, height, seh);
    
    const sev = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];
    const gy = convolution(imageData, width, height, sev);
    return gradientMag(gx, gy);

};

/// Base64 operations

const applyFilter = (base64, filterFc) => {
    // This async function decodes de base64 image and applies a filter to the RGB matrix
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
            const res = filterFc(imageData.data, width, height);
            imageData.data.set(res);
            ctx.putImageData(imageData, 0, 0, 0, 0, width, height);
            const newBase64 = canvas.toDataURL('image/png', 1.0);        
            resolve(newBase64);
        };
        img.src = base64;
    });
};

/// Export methods
export const invert = base64 => applyFilter(base64, invertRGB);
export const borders = base64 => applyFilter(base64, sobel);
export const smooth = base64 => applyFilter(base64, smoothing);