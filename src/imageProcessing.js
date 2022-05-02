
/// RGB matrix operators

const convolution = (rgbImage, se) => {
    /*const sew = filter.length;
    const n = Math.floor(sew/2);
    const W = rgbImage.length;
    const H = rgbImage[0].length;
    const res = [...rgbImage];

    for(let row = n; row < H - n; row++)
        for(let col = n; col < W - n; col++)
        {
            let m = 0, max = 0; // Variable auxiliar, maximo de la matriz resultante

            for(let f2 = 0; f2 < dim; f2++)
                for(let c2 = 0; c2 < dim; c2++)
                {
                    m = rgbImage[col-n+c2 + W*(row-n+f2)] + filter[f2][c2];
                    if( m > max )
                        max = m;
                }
            res[row][col] = [max, max, max];
        }
    */
   return rgbImage;
};

const invertRGB = rgbImage => {
    const resImage = rgbImage;
    for(let i = 0; i < rgbImage.data.length; i+=4){
         resImage.data[i] = 255-rgbImage.data[i];
         resImage.data[i+1] = 255-rgbImage.data[i+1];
         resImage.data[i+2] = 255-rgbImage.data[i+2];
    }
     return resImage;
};  

const borderDetection = image => {
    const se = [
        [-1, -1, -1],
        [0, 0, 0],
        [1, 1, 1]
    ];
    return convolution(image, se);
}

/// Base64 operations

const applyFilter = (base64, filterFc) => {
    // This function decodes de base64 image and applies a filter to the RGB matrix
    return new Promise( (resolve, reject) => {
        const canvas = document.createElement('canvas');                
        const ctx = canvas.getContext('2d');
        const img = new Image();                
        
        const watchdog = setTimeout(()=>{
            reject("Timeout");
        }, 5000);
        
        img.onload = () => {
            clearTimeout(watchdog);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);            
            const resImage = filterFc(imageData);
            ctx.putImageData(resImage, 0, 0, 0, 0, img.width, img.height);
            const base64 = canvas.toDataURL('image/png', 1.0);        
            resolve(base64);
        };

        img.src = base64;
    });
};


/// Export methods
export const invert = base64 => applyFilter(base64, invertRGB);
export const borders = base64 => applyFilter(base64, borderDetection);