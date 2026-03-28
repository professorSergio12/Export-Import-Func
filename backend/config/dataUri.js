import dataUriParser from 'datauri/parser';
import path from 'path';

const dataUriParser = new dataUriParser();

const dataUri = (file) => {
    const ext = path.extname(file.originalname).toString();
    return dataUriParser.format(ext, file.buffer);
}

export default dataUri;