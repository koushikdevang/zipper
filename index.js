const express = require('express')

const multer = require('multer')

const admzip = require('adm-zip')

const fs = require('fs');
const path = require('path');

const app = express()

var dir = "public";
var subDirectory = "public/uploads";

if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    fs.mkdirSync(subDirectory);
}

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "public/uploads");
    },
    filename: function(req,file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

var maxSize = 10* 1024 * 1024

var compressfilesupload = multer({storage: storage,limits:{fileSize:maxSize}})

app.get('/',(req,res)=>{
    res.sendFile(__dirname + "/index.html")
})

app.post('/compressfiles',compressfilesupload.array('file',100),(req,res)=>{

    const zip = new admzip()
    if(req.files){
        req.files.forEach(file => {
            console.log(file.path);
            zip.addLocalFile(file.path)
        });

        var outpuPath = Date.now()+"output.zip"

        fs.writeFileSync(outpuPath,zip.toBuffer())
        res.download(outpuPath, (err)=>{
            if(err){
                req.files.forEach(file =>{
                    fs.unlinkSync(file.path)
                });
                fs.unlinkSync(outpuPath);
                res.send("Error in downloading zip file");
            }
            req.files.forEach(file =>{
                fs.unlinkSync(file.path)
            });
            fs.unlinkSync(outpuPath);
        })
    }
})

app.listen(4000,()=>{
    console.log("App is listening on port 4000");
})