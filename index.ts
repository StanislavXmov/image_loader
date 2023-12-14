import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();

const catalog = '../static/images';

const upload = multer({dest: catalog});
const type = upload.array('filedata', 12);

app.use(express.static(catalog));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getImages', (req, res) => {
	const images: {array: string[]} = {
		array: [],
	}
	fs.readdir(catalog, function(err, filenames){
    if (filenames) {
      for (let item of filenames) {
        images.array.push(item);
      }
      res.send(images); 
    }
  });
});

app.post('/upload', type, (req, res) => {
	// console.log('files', req.files);
  const files = req.files as Express.Multer.File[];
	let srcArr = [];

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const tmpPath = files[i].path;
      const targetPath = path.join(files[i].destination, files[i].originalname);
      const src = fs.createReadStream(tmpPath);
      const dest = fs.createWriteStream(targetPath);

      src.pipe(dest);
      srcArr.push({src, tmpPath});
    }

    for (const s of srcArr) {
      s.src.on('end', function() {
        fs.unlink(s.tmpPath, (err) => {
        if (err) throw err;
        });  
      });
    }
  }
	res.end();  
});



app.listen(5000, () => console.log('Server started'));