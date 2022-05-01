import React, { useState, createRef } from 'react';
import { Container } from '@mui/material';
import defaultImage from './assets/empty-image.png';

const filter = base64 => {
    return new Promise( (resolve, reject) => {
        const canvas = document.createElement('canvas');                
        const ctx = canvas.getContext('2d');
        const img = new Image();                
        
        const watchdog = setTimeout(()=>{
            reject("Timeout");
        }, 5000);
        
        img.onload = () => {
            clearTimeout(watchdog);
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);            
            const resImage = applyFilter(imageData);
            ctx.putImageData(resImage, 0, 0, 0, 0, img.width, img.height);
            const base64 = canvas.toDataURL();        
            resolve(base64);
        };

        img.src = base64;
    });
};

const applyFilter = (rgbImage, filter) => {
    /*
    const sew = filter.length;
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
   const resImage = rgbImage;
   for(let i = 0; i < rgbImage.data.length; i+=4){
        resImage.data[i] = 255-rgbImage.data[i];
        resImage.data[i+1] = 255-rgbImage.data[i+1];
        resImage.data[i+2] = 255-rgbImage.data[i+2];
   }
    return resImage;
};        

    
const App = () => {
    
    const [image, setImage] = useState(defaultImage);
    const inputFile = createRef(null);

    const handleUploadImage = e => {
        e.preventDefault();
        const file = inputFile.current.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e2 => {                
                setImage(e2.target.result);                
                filter(e2.target.result)
                .then(result => {                    
                    setImage(result);
                });
            };
            reader.readAsDataURL(file);
        }else{
            setImage(defaultImage);
        }
    };

    return(
        <Container>   
            <div onClick={() => inputFile.current.click()}>
                <img src={image} width={"100%"} />
                <input 
                    style={{display:"none"}} 
                    type="file" 
                    accept="image/*" 
                    ref={inputFile} 
                    onChange={handleUploadImage} />
            </div>
        </Container>
    );
};

export default App
