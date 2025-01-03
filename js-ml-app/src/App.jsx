import { useState } from 'react'
import './App.css'
import { pipeline } from '@huggingface/transformers';
import { Camera, CameraResultType } from '@capacitor/camera';


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

  // File input using React
  // <input type="file" accept="image/*" onChange={handleImageChange} />
  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setImage(URL.createObjectURL(file));
  //   }
  // }

  const takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl
    });

    setImage(image.dataUrl);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>{model}</p>
        <button onClick={loadModel}>{modelLoadString}</button>
        {modelLoadString === "Loading Model..." && (
          <progress value={progress} max={100} />
        )}
        <img src={image} style={{ width: '100%', maxWidth: '400px', height: 'auto', margin: '0 auto' }}/>
        <button onClick={takePicture}>Take Picture</button>
        <button disabled={pipe == undefined} onClick={translateImage}>Answer Question</button>
        <p style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>{output}</p>
      </div>
    </>
  )
}

export default App
