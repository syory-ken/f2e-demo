const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.use(
    bodyParser.json({
        limit: "10mb",
    })
);

app.use(cors({
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: (origin, callback) => {
      return callback(null, true);
    }
}))

const router = express.Router();

const crypto = require('crypto');

function imageBufferToMD5(buffer) {
    const hash = crypto.createHash('md5');
    hash.update(buffer);
    return hash.digest('hex');
}

router.post('/upload', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.send({
            no: 0,
            message: '文件有误',
            data: err.message
          })
        }
        if (!req.file) {
          return res.send({
            no: 0,
            message: '警告',
            data: 'No file received'
          })
        }
        // 可以考虑将文件通过sharp转换为统一的buffer
        // 否则clipboard直接读取的图片文件会出现在qwen-omni-turbo-latest模型上不能识别的错误
        // 原因，file和clipboard文件的MD5值不一致
        const fileBuffer = await sharp(req.file.buffer).jpeg().toBuffer();
        return res.send({
            no: 0,
            message: 'successful',
            data: imageBufferToMD5(fileBuffer)
        })
      })
});

app.use(router);

var server = http.createServer(app);
server.listen(18888);