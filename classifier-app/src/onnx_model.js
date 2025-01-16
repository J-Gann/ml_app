import ort from "onnxruntime-web"

function argmax(probs) {
    let max     = -Infinity
    let argmax  = -1
    for (let i = 0; i < probs.length; i++) {
        if (probs[i] > max) {
            max = probs[i]
            argmax = i
        }
    }
    return argmax
}
export default class ONNXModel {
     constructor(session) {
        this.session = session
    }
    static async from_pretrained(model_path) {
        const session = await ort.InferenceSession.create(model_path)
        return new ONNXModel(session)
    }

    async get_probs(bag_of_words) {
        const model_input_array = new Float32Array(bag_of_words)
        const model_input       = { input: new ort.Tensor("float32", model_input_array, [1, 512]) }
        const probs = (await this.session.run(model_input))["output"].data
        return probs
    }

    async get_pred(bag_of_words) {
        const probs = await this.get_probs(bag_of_words)
        const prediction = argmax(probs)
        return prediction
    }
}