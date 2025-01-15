import './App.css'

import { useState, useCallback, useRef } from 'react'
import ort from "onnxruntime-web";
import { Camera, CameraResultType } from '@capacitor/camera';
import * as utils from './utils.js'
import vocab from './assets/vocab.json'
import modelPath from './assets/model.onnx'
import test_image from './assets/test_image.png'
import Cropper from 'react-document-crop'


function App() {
  
  const [probImma, setProbImma] = useState("---")
  const [probZert, setProbZert] = useState("---")
  const cropperRef = useRef()
  const [cropState, setCropState] = useState()
  const [image, setImage] = useState(test_image)
  const [cropperKey, setCropperKey] = useState(0)
  const onDragStop = useCallback((s) => setCropState(s), [])
  const onChange = useCallback((s) => setCropState(s), [])
  const [isCropped, setIsCropped] = useState(false)

  const filterCvParams = {
    blur: false,                         // Applies a Gaussian blur to the image.
    //th: true,                            // Applies adaptive thresholding to the image.
    //thMode: cv.ADAPTIVE_THRESH_MEAN_C,   // Determines the method used for adaptive thresholding.
    //thMeanCorrection: 15,                // Adjusts the mean for thresholding.
    //thBlockSize: 25,                     // Determines the size of the block for adaptive thresholding.
    //thMax: 255,                          // Sets the maximum value for thresholding.
    grayScale: true                      // Converts the image to grayscale.
  }


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
    const croppedImage = await cropperRef.current.done({preview: true, filterCvParams})
    setImage(croppedImage)
    setIsCropped(true)
  }


  const takePicture = async () => {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl
    });

    setCropperKey(prev => prev + 1)

    setImage(image.dataUrl);
    setIsCropped(false)
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <Cropper
            ref={cropperRef}
            image={image}
            onChange={onChange}
            onDragStop={onDragStop}
            key={cropperKey}
          />
        </div>
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
