# Cross-Platform Machine Learning using React, Capacitor and Transformers.js

- Transformers.js: https://huggingface.co/docs/transformers.js/en/index
- React: https://react.dev/
- Capacitor: https://capacitorjs.com/


## Setup

1. Follow the [Tutorial](https://huggingface.co/docs/transformers.js/en/tutorials/react) for setting up a React project with Transformers.js
2. Follow the [Tutorial](https://capacitorjs.com/solution/react) for setting up Capacitor with React

## Details

- Transformerjs
    - provides access to HuggingFace pipelines: see [list of pipelines](https://huggingface.co/docs/transformers.js/en/api/pipelines)
    - pipelines usable with onnx models: see [list of compatible models](https://huggingface.co/models?library=transformers.js)
    - Utilizes [onnx-web-runtime](https://huggingface.co/docs/transformers.js/en/api/backends/onnx) for inference. Utilization of [WebGPU](https://huggingface.co/docs/transformers.js/en/guides/webgpu) is possible.
        - more infos from onnx about [web runtime](https://onnxruntime.ai/docs/tutorials/web/)
    - it is possible to use [custom onnx models](https://huggingface.co/docs/transformers.js/en/custom_usage) with pipelines
        - [example of a HF model compatible with transformerjs](https://huggingface.co/Xenova/donut-base-finetuned-cord-v2)
        - [script](https://github.com/huggingface/transformers.js/blob/main/scripts/convert.py) for converting a HF model to onnx (**to be tested**)

- Capacitor
    - enables to package the webapp into a native app (android / ios)

- React
    - enables to quickly build a webapp (could be any other framework)

## Integration with Native App
- Transformerjs should work with flutter: https://pub.dev/packages/flutter_js and javascript bundling (to contain all dependencies) (**to be tested**)


## Exporting Models to ONNX
1. Using plain Pytorch: https://pytorch.org/tutorials/beginner/onnx/export_simple_model_to_onnx_tutorial.html
    - requires configuration and sample input, no apperant way to incorporate preprocessing / tokenizers => preprocessing and tokenization has to be implemented / available on target platform => big hassle

2. Using HF/Optimum: https://huggingface.co/docs/transformers/serialization#exporting-a--transformers-model-to-onnx-with-optimumonnxruntime
    - utilization of existing HF model types for automatic configuration of onnx export => very cool
    - no explicit compilation of preprocessing / tokenizers to onnx but using e.g. Transformers.js pipeline (including tokenizers) can be used => very cool
    - detailed example of HF model compilation: https://github.com/huggingface/notebooks/blob/main/examples/onnx-export.ipynb, https://onnxruntime.ai/docs/tutorials/huggingface.html

## Comments
- relevant onnx runtimes:
    - web
    - mobile (android / ios)
    - react-native
- Further resources about onnx for mobile: https://onnxruntime.ai/inference (**go through tutorials**)
- [onnxruntime-react-native exists](https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html), but has no easy way of using pipelines (e.g. tokenizers, preprocessing, ...)
- using [Electron](https://huggingface.co/docs/transformers.js/en/tutorials/electron), it is possible to package the webapp into a desktop app (windows / mac / linux)





