import React, { useState, createRef } from 'react';
import { Container, Button, Grid } from '@mui/material';
import defaultImage from './assets/empty-image.png';
import { invert } from './imageProcessing';
    
    
const App = () => {
    
    const [image, setImage] = useState(defaultImage);
    const [statusCode, setStatusCode] = useState(0); // 0: no image, 1: loading, 2: ready, 3: processed
    const inputFile = createRef(null);

    const handleUploadImage = e => {
        e.preventDefault();
        const file = inputFile.current.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e2 => {                
                setImage(e2.target.result);                
                setStatusCode(2);
            };
            reader.readAsDataURL(file);
            setStatusCode(1);
        }else{
            setImage(defaultImage);
            setStatusCode(0);
        }
    };

    const handleFilterImage = () => { // Btn callback
        invert(image)
        .then(result => {         
            setImage(result);
            setStatusCode(3);
            inputFile.current.value = ""; // Clear input file to allow user to upload the same image
        });
    }

    return(
        <Container>   
            <Grid 
                container 
                justifyContent="center" 
                alignItems="center" 
                onClick={() => inputFile.current.click()}>
                    <img src={image} style={{width:"100%", maxWidth:"600px"}} />
                    <input 
                        style={{display:"none"}} 
                        type="file" 
                        accept="image/*" 
                        ref={inputFile} 
                        onChange={handleUploadImage} />
            </Grid>

            <Grid 
                container 
                justifyContent="center" 
                alignItems="center" 
                style={{marginTop:"10px"}}>
                    <Button 
                        style={{width: "300px"}}
                        size="large" 
                        variant="contained" 
                        onClick={handleFilterImage} 
                        disabled={statusCode!==2}>
                            Apply filter
                    </Button>
            </Grid>
        </Container>
    );
};

export default App
