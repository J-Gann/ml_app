import './App.css'

import { useState, useCallback, useRef } from 'react'
import ort from "onnxruntime-web";
import { Camera, CameraResultType } from '@capacitor/camera';
import * as utils from './utils.js'
import vocab from './assets/vocab.json'
import modelPath from './assets/model.onnx'
import test_image from './assets/test_image.png'

function App() {
  
  const [probImma, setProbImma] = useState("---")
  const [probZert, setProbZert] = useState("---")
  const [image, setImage] = useState(test_image)
  const [isCropped, setIsCropped] = useState(false)
  const scanner = new jscanify();


  async function run_model() {
   
    setProbImma("---")
    setProbZert("---")




    
    const vocab_map = new Map(vocab)
    const png_text = await utils.extract_text_from_png(image)
    const sample_tokens = utils.tokenize_text(png_text)
    const bow = utils.bow_from_tokens(sample_tokens, vocab_map)

    const session = await ort.InferenceSession.create(modelPath)
    const model_input_array = new Float32Array(bow)
    const model_input = { input: new ort.Tensor("float32", model_input_array, [1, 512]) }
    const probs = (await session.run(model_input))["output"].data

    setProbImma(probs[0])
    setProbZert(probs[1])

  }

  const handleCrop = async () => {
    // Create a canvas to manipulate the original image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load the full-resolution image
    const img = new Image();
    img.src = image; // image is the full dataUrl from Camera.getPhoto
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    // Set canvas dimensions to the original image dimensions
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the image at full resolution
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    // Use OpenCV.js for processing at full resolution
    const srcMat = cv.imread(canvas);
    const contour = scanner.findPaperContour(srcMat);
    const cornerPoints = scanner.getCornerPoints(contour);
  
    const height = cornerPoints.bottomLeftCorner.y - cornerPoints.topLeftCorner.y;
    const width = cornerPoints.topRightCorner.x - cornerPoints.topLeftCorner.x;
  
    const croppedImage = scanner.extractPaper(canvas, width, height, cornerPoints);
    
    // Set the cropped image as the new image
    setImage(croppedImage.toDataURL());
    
    // Cleanup OpenCV Mat objects
    srcMat.delete();
    croppedImage.delete();
  };


  const takePicture = async () => {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl
    });

    setImage(image.dataUrl);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '0 auto', width: '100%'}}>

        <img id="image" src={image} />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={takePicture}>Take Picture</button>
          <button onClick={handleCrop} disabled={isCropped}>Crop Image</button>
          <button onClick={run_model}>Run Model</button>
        </div>
        
        <div style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
          <p>Wahrscheinlichkeit einer Immatrikulation:</p>
          <p>{probImma}</p>
          <p>Wahrscheinlichkeit eines Zertifikats:</p>
          <p>{probZert}</p>
        </div>

      </div>
    </>
  )
}

export default App
