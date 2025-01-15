import './App.css'
import { useState } from 'react'
import ort from "onnxruntime-web";
import { Camera, CameraResultType } from '@capacitor/camera';
import * as utils from './utils.js'
import vocab from './assets/vocab.json'
import modelPath from './assets/model.onnx'
import test_image from './assets/test_image.png'
import { loadPyodide } from './pyodide/pyodide.mjs'

function App() {
  
  const [image, setImage] = useState(test_image)
  const [probImma, setProbImma] = useState("---")
  const [probZert, setProbZert] = useState("---")

  async function run_model() {
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


  const takePicture = async () => {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl
    });

    setImage(image.dataUrl);
 
  };

  async function run_python() {
    let pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/"
    });
    await pyodide.loadPackage("micropip", {checkIntegrity: false});
    const micropip = pyodide.pyimport("micropip");
    await micropip.install("snowballstemmer");
    await pyodide.runPython(`
    import snowballstemmer
    stemmer = snowballstemmer.stemmer('english')
    print(stemmer.stemWords('go goes going gone'.split()))
    `);
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <img src={image} style={{ width: '100%', maxWidth: '400px', height: 'auto', margin: '0 auto' }}/>
        <button onClick={takePicture}>Take Picture</button>
        <button onClick={run_model}>Run Model</button>
        <div style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
          <p>Wahrscheinlichkeit einer Immatrikulation:</p>
          <p>{probImma}</p>
          <p>Wahrscheinlichkeit eines Zertifikats:</p>
          <p>{probZert}</p>
        </div>
        <button onClick={run_python}>Run Python</button>
      </div>
    </>
  )
}

export default App
