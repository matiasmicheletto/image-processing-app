import React, { useState, createRef } from 'react';
import { Container, Button, Grid, Select, MenuItem } from '@mui/material';
import defaultImage from './assets/empty-image.png';
import { invert, borders, smooth } from './imageProcessing';
    
    
const App = () => {
    
    const [image, setImage] = useState(defaultImage);
    const [statusCode, setStatusCode] = useState(0); // 0: no image, 1: loading, 2: ready, 3: processed
    const [filterName, setFilterName] = useState("invert");
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

        let filter = ()=>{};
        switch(filterName){
            case "invert":
                filter = invert;
                break;
            case "borders":
                filter = borders;
                break;
            case "smooth":
                filter = smooth;
                break;
            default:
                filter = invert;
        }

        filter(image)
        .then(result => {         
            setImage(result);
            setStatusCode(3);
            inputFile.current.value = ""; // Clear input file to allow user to upload the same image
        });
    };

    const handleFilterChange = e => {
        console.log(e.target.value);
        setFilterName(e.target.value);
    };

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
                direction="row"
                justifyContent="center" 
                alignItems="center" 
                style={{marginTop:"10px"}}>
                    <Grid item xs={12} sm={6}>
                        <Select 
                            style={{width: "100%"}}
                            value={filterName}
                            onChange={handleFilterChange}>
                            <MenuItem value="invert">Invert</MenuItem>
                            <MenuItem value="borders">Borders</MenuItem>
                            <MenuItem value="smooth">Smooth</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button 
                            style={{width: "100%"}}
                            size="large" 
                            variant="contained" 
                            onClick={handleFilterImage} 
                            disabled={statusCode!==2}>
                                Apply filter
                        </Button>
                    </Grid>
            </Grid>
        </Container>
    );
};

export default App
