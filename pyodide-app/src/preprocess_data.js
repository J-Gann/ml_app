import * as utils from './utils.js'
import {Filesystem, Directory, Encoding} from '@capacitor/filesystem';

async function preprocess_data(vocab, split) {
    folder_path = `./data/${split}`
    const num_samples = fs.readdirSync(folder_path, { withFileTypes: true }).length

    for (let sample_num = 0; sample_num < num_samples; sample_num++) {
        const pngs_path = `./data/${split}/${sample_num}/pngs`
        const num_pngs = fs.readdirSync(pngs_path, { withFileTypes: true }).length 

        let sample_tokens = []
        for (let png_num = 0; png_num < num_pngs; png_num++) {
            const png_path = `./data/${split}/${sample_num}/pngs/${png_num}.png` 

            const png_text = await utils.extract_text_from_png(png_path)
            sample_tokens.push(...utils.tokenize_text(png_text))
        }
        const bow = utils.bow_from_tokens(sample_tokens, vocab)
        const bow_path = `./data/${split}/${sample_num}/bow.json`
        fs.writeFileSync(bow_path, JSON.stringify(bow), "utf-8");
    }
}

async function main() {
    const jsonString = fs.readFileSync("vocab.json", "utf-8");
    const jsonArray = JSON.parse(jsonString);
    const vocab = new Map(jsonArray);
    
    await preprocess_data(vocab, split="training")
    await preprocess_data(vocab, split="validation")
}

main()