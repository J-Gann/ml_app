import './App.css'
import { useState } from 'react'
import ort from "onnxruntime-web";
import { Camera, CameraResultType } from '@capacitor/camera';
import * as utils from './utils.js'
import vocab from './assets/vocab.json'
import modelPath from './assets/model.onnx'
import test_image from './assets/test_image.png'
import { loadPyodide } from './pyodide/pyodide.mjs'
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

function App() {
  const initialCode = `
import snowballstemmer

stemmer = snowballstemmer.stemmer('english');
print(stemmer.stemWords("What is going on?".split()));

import numpy as np
array = np.array([1, 2, 3, 4, 5])
print(array)
`

  const [code, setCode] = useState(initialCode);
  const [pipPackages, setPipPackages] = useState(['snowballstemmer', 'numpy']);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);

  async function load_pyodide() { 
    let pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/"
    });
    pyodide.setStdout({ batched: (msg) => setOutput(prev => prev + "\n" + msg) });
    setPyodide(pyodide);
  }

  async function run_python() {
    await pyodide.loadPackage("micropip", {checkIntegrity: false});
    const micropip = pyodide.pyimport("micropip");
    for (const pipPackage of pipPackages) {
      await micropip.install(pipPackage);
    }
    const result = await pyodide.runPython(code);
    if (result) {
      setOutput(prev => prev + "\n" + "Result: " + result);
    }
  }

  return (
    <>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
    <CodeMirror
        value={code}
        onChange={(value) => setCode(value)}
        height="300px"
        width="600px"
        theme="dark"
        extensions={[python()]}
        style={{textAlign: 'left'}}
      />

      <p>Pip Packages: <input type="text" value={pipPackages.join(',')} onChange={(e) => setPipPackages(e.target.value.split(','))}></input></p>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <button onClick={load_pyodide} disabled={pyodide}>Load Pyodide</button>
        <button onClick={run_python} disabled={!pyodide}>Run Python</button>
      </div>
      <p>Output:</p>
      <textarea id="output" rows="20" cols="80" value={output} readOnly></textarea>
    </div>
    </>
  )
}

export default App
