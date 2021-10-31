const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const {Product} = require('../models/product.model')
const {Category} = require('../models/category.model')
const multer = require('multer')

const FILE_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

//IMAGES UPLOAD
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE[file.mimetype]
        let uploadError = new Error('Invalid image type')

        if(isValid){
            uploadError = null
        }

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.replace(' ', '-')
      const extension = FILE_TYPE[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })

//CREATE
router.post(`/`, uploadOptions.single('image'), async (req, res)=>{
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send('Invalid Category')
    }

    const file = req.file;
    if(!file){
        return res.status(400).send('No image in the request')
    }

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, //http://localhost:3000/public/local/image-fileName
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    //saving data to the DB
    product = await product.save()

    if(!product){
        return res.status(404).send('The product cannot be created')
    }
    res.send(product)
})


//READ
router.get(`/`, async (req, res)=>{
    //To filter into categories and display accordingly
    let filter = {}
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }
    //retrieving data from DB
    const productList = await Product.find(filter).populate('category')    //.select('name image -_id') // by default we get an id to remove it, we used -_id.
    //To check error
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList)
})

router.get(`/:id`, async (req, res)=>{
    const product = await Product.findById(req.params.id).populate('category');
    //To check error
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product)
})

//UPDATE
router.put(`/:id`, uploadOptions.single('image'), async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send('Invalid Category')
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagePath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image; //Declaring previous image
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {
            new: true
        }
    )
    if(!updatedProduct){
        return res.status(404).send('The category cannot be updated')
    }
    res.send(updatedProduct)
})

//UPDATE MULTIPLE IMAGES
router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        let imagesPaths = [];
        
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.fileName}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('The gallery cannot be updated!');

        res.send(product);
    }
);

//DELETE
router.delete(`/:id`, (req,res)=>{
    Product.findByIdAndRemove(req.params.id)
    .then((product)=>{
       if(product){
        return res.status(200).json({success: true, message: 'The product is deleted'})
       } else {
           return res.status(404).json({success: false, message: 'product not found!'})
       }
    })
    .catch((err)=>{
        return res.status(400).json({success: false, error: err})
    })
})

//COUNT PRODUCT
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount,
    });
});

//FEATURED PRODUCT TO DISPLAY IN THE HOME SCREEN
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(count)

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});






module.exports = router;
