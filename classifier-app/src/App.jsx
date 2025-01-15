import './App.css'

import { useState } from 'react'
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
  const [full_image, setFullImage] = useState(test_image) // stores the full sized image (image seems to be scaled down by react on mobile)
  const [ocrText, setOcrText] = useState("") // Add new state for OCR text
  const scanner = new jscanify();

  async function run_model() {
   
    setProbImma("---")
    setProbZert("---")
    
    const vocab_map = new Map(vocab)
    const png_text = await utils.extract_text_from_png(full_image)
    setOcrText(png_text) // Store the extracted text
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
    // create on the fly canvas to use full sized image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = full_image;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    const srcMat = cv.imread(canvas);
    const contour = scanner.findPaperContour(srcMat);
    const cornerPoints = scanner.getCornerPoints(contour);
  
    const height = cornerPoints.bottomLeftCorner.y - cornerPoints.topLeftCorner.y;
    const width = cornerPoints.topRightCorner.x - cornerPoints.topLeftCorner.x;
  
    const croppedImage = scanner.extractPaper(canvas, width, height, cornerPoints);
    
    // Convert to black and white
    const bwCanvas = document.createElement('canvas');
    const bwCtx = bwCanvas.getContext('2d');
    bwCanvas.width = croppedImage.width;
    bwCanvas.height = croppedImage.height;
    
    // Draw the cropped image onto the new canvas
    bwCtx.drawImage(croppedImage, 0, 0);
    
    //const mat = cv.imread(bwCanvas);
    //const blurred = new cv.Mat();
    //// Adjust kernel size (must be odd numbers) and sigma to control blur strength
    //cv.GaussianBlur(mat, blurred, new cv.Size(1, 1), 1, 1);
    //cv.imshow(bwCanvas, blurred);
    //
//
    //// Get image data and convert to grayscale
    //const imageData = bwCtx.getImageData(0, 0, bwCanvas.width, bwCanvas.height);
    //const data = imageData.data;
    //
    //for (let i = 0; i < data.length; i += 4) {
    //  const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    //  // Apply threshold to make it black and white (not grayscale)
    //  const threshold = 128;
    //  const value = avg > threshold ? 255 : 0;
    //  data[i] = value;     // red
    //  data[i + 1] = value; // green
    //  data[i + 2] = value; // blue
    //}
    //
    //bwCtx.putImageData(imageData, 0, 0);
    
    setImage(bwCanvas.toDataURL());
    setFullImage(bwCanvas.toDataURL());

    srcMat.delete();
  };


  const takePicture = async () => {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl
    });

    setImage(image.dataUrl);
    setFullImage(image.dataUrl)
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '0 auto', width: '100%'}}>

        <img id="image" src={image} />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={takePicture}>Take Picture</button>
          <button onClick={handleCrop}>Crop Image</button>
          <button onClick={run_model}>Run Model</button>
        </div>
        
        <div style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
          <p>Wahrscheinlichkeit einer Immatrikulation:</p>
          <p>{probImma}</p>
          <p>Wahrscheinlichkeit eines Zertifikats:</p>
          <p>{probZert}</p>
        </div>

        <div style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
          <p>Extracted Text:</p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, textAlign: 'left' }}>
            {ocrText}
          </pre>
        </div>

      </div>
    </>
  )
}

export default App
