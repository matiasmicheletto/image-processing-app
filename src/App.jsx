import React, { useState, createRef } from 'react';
import { Container, Button, Grid, Select, MenuItem } from '@mui/material';
import defaultImage from './assets/empty-image.png';
import filter, { filtersList } from './imageProcessing';
import { camelize } from './utils';

const App = () => {
    
    const [image, setImage] = useState(defaultImage);
    const [statusCode, setStatusCode] = useState(0); // 0: no image, 1: loading, 2: ready, 3: processed
    const [filterName, setFilterName] = useState("invert");
    const [elapsed, setElapsed] = useState(-1);
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
        setElapsed(-1);
    };

    const handleFilterImage = () => { // Btn callback        
        filter(image, filterName)
        .then(result => {         
            setImage(result.image);
            setElapsed(result.elapsed);
            setStatusCode(3);
            inputFile.current.value = ""; // Clear input file to allow user to upload the same image
        });
    };

    const handleFilterChange = e => {        
        setFilterName(e.target.value);
        setStatusCode(2);
    };

    return(
        <Container style={{maxWidth: "600px", margin: "0 auto"}}>
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
                    {elapsed > -1 && 
                        <span style={{textAlign:"right", width:"100%"}}>
                            Processing time: {elapsed} ms
                        </span>
                    }
            </Grid>
            <Grid 
                container 
                direction="column"
                justifyContent="center" 
                alignItems="center" 
                style={{marginTop:"10px"}}>
                    <Select 
                        style={{width: "100%", marginTop: "20px"}}
                        value={filterName}
                        onChange={handleFilterChange}>
                        {filtersList.map((filter, key) => <MenuItem key={key} value={filter}>{camelize(filter)}</MenuItem>)}
                    </Select>                        
                    <Button 
                        style={{width: "100%", marginTop: "20px"}}
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
