const express = require('express');
const app = express();
let docconverter = require('docx-pdf');
const path = require('path');
const groupdocs_conversion_cloud = require('groupdocs-conversion-cloud');
// import { Powerpoint, Word } from 'pdf-officegen'
const {Word,Powerpoint }= require('pdf-officegen');
// const bodyParser  = require("body-parser");

// app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// app.set('view engine','ejs');

app.get('/', (req, res) => {
    res.render("index");
    // __dirname+'/public/index.html'
});

const fs = require("fs");
const multer = require("multer");
// const {TesseractWorker} = require('tesseract.js');
// const worker = new TesseractWorker();
// const { createWorker } = require("tesseract.js");
// const worker = new createWorker({
//   logger: (m) => console.log(m),
// });
const Tesseract = require("tesseract.js");

const { createWorker } = require("tesseract.js");
const worker = createWorker();


// Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage }).single("avatar");
// Routes

app.post("/OCR", (req, res) => {
    upload(req, res, (err) => {
        console.log(req.file);
        // fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
        //     if(err) return console.log('This is your error', err);

        //     worker
        //     .recognize(data, 'eng', {tessjs_create_pdf: '1'})
        //     .progress(progress => {
        //         console.log(progress);
        //     })
        //     .then(result => {
        //         res.send(result.text);
        //     })
        //     .finally(() => worker.terminate());
        // });

        try {
            Tesseract.recognize(
                'uploads/' + req.file.filename,
                'eng',
                { logger: m => console.log(m) }
            ).then(({ data: { text } }) => {

                const { jsPDF } = require("jspdf"); // will automatically load the node version

                const doc = new jsPDF();
                doc.text(text, 10, 10);
                doc.save("a4.pdf"); // will save the file in the current working directory

                return res.redirect("/download")
            })
        } catch (error){
            console.log(error);
        }
    });
});


//This is docx to pdf start

app.post('/WORDTOPDF', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err)
            return res.end("Something went wrong");
        }
        else {
            var name = req.file.path;
            track = name;
            console.log(name);
            docconverter(`${name}`, `${name}.pdf`, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("some error taken place");
                } else {
                    console.log("result" + result);
                    fs.unlinkSync(`${track}`);

                    res.download(`${track}.pdf`, (err) => {
                        if (err) {
                            res.send("some error taken place");
                        }
                        fs.unlinkSync(`${track}.pdf`);
                    })
                }
            })
        }
    })
})
//docx to pdf end

//pdf to word start

// app.post('/PDFTOWORD', (req, res) => {
//     upload(req, res, function (err) {
//         if (err) {
//             console.log(err)
//             return res.end("Something went wrong");
//         }
//         else {
//             var name = req.file.path;
//             track = name;
//             console.log(name);

//             const options = { clean: true };
//             const p = new Powerpoint([options])
//             const w = new Word([options]);

//             w.convertFromPdf(name, `${name}.pdf`, (err, result) => {
//                 //Do something with the result (filepath to output)
//                 console.log(result);

//                 // fs.writeFile(`${name}.docx`, result, "binary", function (err) { });

//                 res.download(`${track}.docx`, (err) => {
//                     if (err) {
//                         res.send("some error taken place");
//                     }
//                 // fs.unlinkSync(`${track}.pdf`);
//             })

//         })
//     }
// })
// })



// read file from local disk
// let file = fs.readFileSync(name);

// // create convert document direct request
// let request = new groupdocs_conversion_cloud.ConvertDocumentDirectRequest("docx", file);

// // convert document directly
// let result = convertApi.convertDocumentDirect(request);

// // save file in working dorectory
// fs.writeFile(`${name}.docx`, result, "binary", function (err) { });
// console.log("Document converted: " + result.length);








//pdf to word end





app.get("/download", (req, res) => {
    const file = `${__dirname}/a4.pdf`;
    res.download(file);
});

// app.get('/:tool', (req, res)=>{
//     res.render('toolPage',{title:req.params.tool});
// });



// app.post("/:tool",(req, res)=>{
//     console.log(req.params.tool);
// });









app.listen(3000, () => { console.log("The server got started at the port 3000"); });

