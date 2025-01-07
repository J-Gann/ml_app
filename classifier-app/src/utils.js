import { createWorker } from 'tesseract.js';
import {stemmer} from 'stemmer'


function tokenize_text(text) {
    const cleanedText = text
        .toLowerCase()
        .replace(/[^\w\säöüß]/g, '')  
        .replace(/\s+/g, ' ')            
        .trim() 

    const tokens = cleanedText.split(' ').map(word => stemmer(word))
    return tokens
}

function bow_from_tokens(tokens, vocab) {
    let bow = Array(vocab.size).fill(0);

    tokens.forEach((token) => {
        if (vocab.has(token)) {
            bow[vocab.get(token)] += 1
        } else {
            bow[vocab.get("<|UNK|>")] += 1
        }
    })
    return bow
}

async function extract_text_from_png(png_path) {
    try {
        const worker = await createWorker('deu');
        const { data: { text } } = await worker.recognize(png_path, 'deu');
        return text;
    } catch (error) {
        throw new Error(`Failed to extract German text: ${error.message}`);
    } 
}

export { extract_text_from_png, tokenize_text, bow_from_tokens }