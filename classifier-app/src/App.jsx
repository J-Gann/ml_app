import './App.css'

import frog from './assets/frog.webp'
import { useState } from 'react'
import { Camera, CameraResultType } from '@capacitor/camera';
import vocab from './assets/vocab.json'
import modelPath from './assets/model.onnx'
import test_imma from './assets/test_imma.png'
import test_cert from './assets/test_cert.png'
import test_invoice from './assets/test_invoice.png'
import DataProcessor from './data_processor.js'
import ONNXModel from './onnx_model.js'
import { defineCustomElements } from '@ionic/pwa-elements/loader';


function App() {

  const [probImma, setProbImma] = useState("---")
  const [probZert, setProbZert] = useState("---")
  const [probInvoice, setProbInvoice] = useState("---")
  const [image, setImage] = useState(test_imma)
  const [full_image, setFullImage] = useState(test_imma) // stores the full sized image (image seems to be scaled down by react on mobile)
  const [ocrText, setOcrText] = useState("") // Add new state for OCR text
  const [executionTime, setExecutionTime] = useState("---")

  const scanner = new jscanify();

  defineCustomElements(window);

  async function run_model() {

    setProbImma("---")
    setProbZert("---")
    setProbInvoice("---")
    setExecutionTime("---")
    setOcrText("")

    const start = performance.now();

    const data_processor = DataProcessor.from_pretrained(vocab)
    const model = await ONNXModel.from_pretrained(modelPath)

    const [bow, text] = await data_processor.bow_from_sample(full_image)
    setOcrText(text)
    const probs = await model.get_probs(bow)

    const end = performance.now();
    setExecutionTime(end - start)

    setProbImma(probs[0])
    setProbZert(probs[1])
    setProbInvoice(probs[2])
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

    const bwCanvas = document.createElement('canvas');
    const bwCtx = bwCanvas.getContext('2d');
    bwCanvas.width = croppedImage.width;
    bwCanvas.height = croppedImage.height;

    bwCtx.drawImage(croppedImage, 0, 0);

    setImage(bwCanvas.toDataURL());
    setFullImage(bwCanvas.toDataURL());

    srcMat.delete();
  };


  const takePicture = async () => {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
    });

    setImage(image.dataUrl);
    setFullImage(image.dataUrl)
  };

  const set_image = (image) => {
    setImage(image)
    setFullImage(image)
  }

  const get_predicted_class = () => {
    const max_prob = Math.max(probImma, probZert, probInvoice)
    if (max_prob === probImma) return "Immatriculation"
    if (max_prob === probZert) return "Certificate"
    if (max_prob === probInvoice) return "Invoice"
  }

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',

        borderBottom: '1px solid #ddd'
      }}>
        <img
          src={frog}
          style={{
            height: '50px',
            marginRight: '15px'
          }}
        />
        <h1 style={{
          margin: 0,
          fontSize: '24px',

        }}>
          Document Classifier
        </h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '0 auto', width: '100%' }}>

        <img id="image" src={image} />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <select onChange={(e) => set_image(e.target.value)}>
            <option value="">Select preloaded document</option>
            <option value={test_imma}>Immatriculation</option>
            <option value={test_cert}>Certificate</option>
            <option value={test_invoice}>Invoice</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={takePicture}>Take Picture</button>
          <button onClick={handleCrop}>Crop Image</button>
          <button onClick={run_model}>Run Model</button>
        </div>

        <div style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>

          {get_predicted_class() && <p style={{
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '5px',
            borderRadius: '5px',
            display: 'inline-block',
            backgroundColor: '#90EE90',
            color: "#242424"
          }}>{get_predicted_class()}</p>}

          <p>Class Probabilities:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '150px auto', justifyContent: 'center' }}>
            <p style={{ margin: 0, textAlign: 'left' }}>Immatriculation:</p>
            <p style={{ margin: 0, textAlign: 'left' }}>{typeof probImma === 'number' ? probImma.toFixed(3) * 100 : probImma}%</p>
            <p style={{ margin: 0, textAlign: 'left' }}>Certificate:</p>
            <p style={{ margin: 0, textAlign: 'left' }}>{typeof probZert === 'number' ? probZert.toFixed(3) * 100 : probZert}%</p>
            <p style={{ margin: 0, textAlign: 'left' }}>Invoice:</p>
            <p style={{ margin: 0, textAlign: 'left' }}>{typeof probInvoice === 'number' ? probInvoice.toFixed(3) * 100 : probInvoice}%</p>
          </div>
          <br />
          <p style={{ margin: 0, textAlign: 'center', fontSize: '15px', color: '#888' }}>Execution Time: {typeof executionTime === 'number' ? (executionTime / 1000).toFixed(2) : executionTime} s</p>

        </div>


        <div style={{ border: '1px solid black', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, textAlign: 'left' }}>
            {ocrText}
          </pre>
        </div>

      </div>

    </>
  )
}

export default App
