import { createWorker } from 'tesseract.js';
import {stemmer} from 'stemmer'

let tesseract_worker;

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

async function get_tesseract_worker() {
    if (tesseract_worker) {
        return tesseract_worker;
    }
    tesseract_worker = await createWorker('deu');
    return tesseract_worker;
}

async function extract_text_from_png(png_path) {
    try {
        const tesseract_worker = await get_tesseract_worker();
        const { data: { text } } = await tesseract_worker.recognize(png_path, 'deu');
        return text;
    } catch (error) {
        throw new Error(`Failed to extract German text: ${error.message}`);
    } 
}

export { extract_text_from_png, tokenize_text, bow_from_tokens }