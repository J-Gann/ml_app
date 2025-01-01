import { useState } from 'react'
import './App.css'
import { pipeline } from '@huggingface/transformers';


let pipe;

function App() {
  const [output, setOutput] = useState('');
  const [modelLoadString, setModelLoadString] = useState('Load Model');
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/invoice.png');

  function progress_callback(progress) {
    if (progress.progress) {
      setProgress(progress.progress);
    }
  }

  const loadModel = async () => {
    setModelLoadString("Loading Model...")
    pipe = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', {progress_callback});
    console.log("Model loaded");
    setModelLoadString("Model Loaded")
  }

  const translateImage = async () => {
    const output = await pipe(image)
    console.log(output);
    setOutput(output[0].generated_text);
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
