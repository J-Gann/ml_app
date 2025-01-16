import { tokens_from_sample } from "./common.js";

export default class DataProcessor {
    constructor(vocab_map) {
        this.vocab_map = vocab_map
    }

    static from_pretrained(vocab_file) {
        return new DataProcessor(new Map(vocab_file))
    }

    bow_from_tokens(tokens) {
        let bow = Array(this.vocab_map.size).fill(0);
        tokens.forEach((token) => {
            if (this.vocab_map.has(token)) {
                bow[this.vocab_map.get(token)] += 1
            } else {
                bow[this.vocab_map.get("<|UNK|>")] += 1
            }
        })
        return bow
    } 

    async bow_from_sample(sample_path) {
        const [tokens, text] = await tokens_from_sample(sample_path)
        return [this.bow_from_tokens(tokens), text]
    }
}