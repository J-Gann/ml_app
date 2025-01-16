import { stemmer } from 'stemmer'
import Tesseract from 'tesseract.js'

const LABELS = {
    "certificate_of_enrollment": 0,
    "certificate_of_achievement": 1,
    "invoice": 2
}

const STOP_WORDS = {
    "articles":         [ "der", "die", "das", "ein", "eine", "einem", "einer", "eines" ],
    "conjunctions":     [ "und", "oder", "aber", "denn", "doch", "sondern", "weil", "ob", "wenn", "als" ],
    "prepositions":     [ "in", "an", "auf", "bei", "mit", "nach", "von", "zu", "über", "unter", "vor", "aus", "durch", "für", "gegen", "ohne", "um", "zwischen" ],
    "pronouns":         [ "ich", "du", "er", "sie", "es", "wir", "ihr", "mich", "dich", "ihn", "uns", "euch", "mir", "dir", "ihm", "ihr", "ihnen", "mein", "dein", "sein", "unser", "euer", "ihre" ],
    "auxiliary_verbs":  [ "bin", "bist", "ist", "sind", "seid", "war", "warst", "waren", "wart", "gewesen", "habe", "hast", "hat", "haben", "hattet", "hatte", "hatten" ],
    "adverbs":          [ "nicht", "nie", "immer", "oft", "selten", "sehr", "so", "schon", "hier", "da", "dort", "wo", "wie", "warum", "wann" ],
    "question_words":   [ "wer", "was", "wo", "wann", "warum", "wie", "welche", "welcher", "welches" ],
    "negations":        [ "nicht", "kein", "keine", "keiner", "keines" ],
    "miscellaneous":    [ "ja", "nein", "doch", "wohl", "mal", "nun", "noch", "auch", "nur", "alle", "alles", "beide", "jeder", "jedes", "jemand", "niemand", "etwas", "nichts", "man", "deren", "dessen" ]
}
function get_stop_words() {
    const all_stop_words = Object.values(STOP_WORDS).flat()
    return all_stop_words
}

function tokenize_text(text) {
    const cleaned_text = text
        .toLowerCase()
        .replace(/[^\w\säöüß]/g, '')  
        .replace(/\s+/g, ' ')            
        .trim() 

    const tokens = cleaned_text.split(' ').map(word => stemmer(word))
    return tokens
}

async function extract_text_from_png(png_path) {
    try {
        const { data: { text } } = await Tesseract.recognize(png_path, 'deu');
        return text;
    } catch (error) {
        throw new Error(`Failed to extract German text: ${error.message}`);
    } 
}

async function tokens_from_sample(sample_path) {
    const png_text = await extract_text_from_png(sample_path)
    return [tokenize_text(png_text), png_text]
}

export {
    LABELS,
    tokenize_text,
    extract_text_from_png,
    tokens_from_sample, 
    get_stop_words,
};