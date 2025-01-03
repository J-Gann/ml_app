import { useState } from 'react'
import './App.css'
import { pipeline } from '@huggingface/transformers';


let pipe;

function App() {
  const [output, setOutput] = useState('');
  const [modelLoadString, setModelLoadString] = useState('Load Model');
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/tiger.jpg');
  const [model, setModel] = useState("Xenova/vit-base-patch16-224");

  function progress_callback(progress) {
    if (progress.progress) {
      setProgress(progress.progress);
    }
  }

  const loadModel = async () => {
    setModelLoadString("Loading Model...")
    pipe = await pipeline('image-classification', model, {progress_callback});
    console.log("Model loaded");
    setModelLoadString("Model Loaded")
  }

  const translateImage = async () => {
    const output = await pipe(image)
    const top_result = output[0].label;
    console.log(output);
    setOutput(top_result);
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  }


  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>{model}</p>
        <button onClick={loadModel}>{modelLoadString}</button>
        {modelLoadString === "Loading Model..." && (
          <progress value={progress} max={100} />
        )}
        <img src={image} style={{ width: '200px', height: '200px' }}/>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={translateImage}>Answer Question</button>
        <p>{output}</p>
      </div>
    </>
  )
}

export default App
