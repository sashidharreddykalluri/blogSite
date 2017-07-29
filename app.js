var express           = require('express'),
    bodyparser        = require('body-parser'),
    mongoose          = require("mongoose"),
    app               = express(),
    expressSanitizer  = require('express-sanitizer'),
    methodOverride    = require('method-override');

// App Config
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({encoded: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

// Mongoose/Model config
mongoose.connect('mongodb://localhost/blogpost_app');
 // 1. Schema
 var blogpostSchema = new mongoose.Schema({
     title   : String,
     image   : String,
     body    : String,
     created : {type: Date, default: Date.now}
 });
 
 // 2. model
 var blogpost = mongoose.model('Blog', blogpostSchema);

// ***RESTFUL ROUTES***

// HOMEPAGE
app.get('/', function(req, res) {
   res.redirect('/blogs'); 
});

app.get('/blogs', function(req, res){
    blogpost.find({}, function(err, result){
        if(err){
            console.log('something went wrong');
        }else{
            res.render('index', {posts: result});
        }
    });
});

// NEW blog post
app.get('/blogs/new', function(req, res) {
    res.render('newblog');
});

// CREATE or Add post to the database
app.post('/blogs', function(req, res){
    
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogpost.create(req.body.blog, function(err, result){
        if(err){
            console.log('something went wrong');
            res.send('could not save this post');
        }else{
            res.redirect('/blogs');
        }
    });
});

//SHOW: shows more details
app.get('/blogs/:id', function(req, res) {
    blogpost.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        }else{
            res.render('show', {blog: foundBlog});
        }
    });
});

// EDIT: shows the form for edit
app.get('/blogs/:id/edit', function(req, res) {
    blogpost.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        }else{
            res.render('edit', {blog: foundBlog});
        }
    });
});

//UPDATE Route
app.put('/blogs/:id', function(req, res){
   req.body.blog.body = req.sanitize(req.body.blog.body);
   blogpost.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.redirect('/blogs');
       }else{
           res.redirect('/blogs/'+req.params.id);
       }
   });
});

// DELETE ROUTE
app.delete('/blogs/:id', function(req, res){
blogpost.findByIdAndRemove(req.params.id, function(err){
    if(err){
        console.log('delete error');
    }else{
        res.redirect('/blogs');
    }
});
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('blogpost app server has started!!!!');
});