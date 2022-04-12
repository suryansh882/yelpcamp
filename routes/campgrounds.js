var express= require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleWare = require("../middleware");
const { text } = require("body-parser");

//INDEX - SHOW ALL CAMPGROUNDS
router.get("/",function(req,res){
    var noMatch=null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function(err,allcampgrounds){
            if(err)
            console.log(err);
            else{
                
                if(allcampgrounds.length<1) {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index",{campgrounds:allcampgrounds, page: "campgrounds",noMatch: noMatch});
            }
        });
    } else {
        //Get all campgrounds from DB
        Campground.find({}, function(err,allcampgrounds){
            if(err)
            console.log(err);
            else{
                res.render("campgrounds/index",{campgrounds:allcampgrounds, page: "campgrounds",noMatch: noMatch});
            }
        });
    }
});

// CREATE - ADD NEW CAMPGROUND TO DB
router.post("/",middleWare.isLoggedIn,function(req,res){
    // get data from form and add to campgrounds array
    var name=req.body.name;
    var image=req.body.image;
    var price=req.body.price;
    var desc=req.body.description;
    var author = {
        id: req.user.id,
        username: req.user.username
    };
    var newCampground={name:name,price:price, image:image,description:desc, author:author};
    //Create a new campground and save to database
    Campground.create(newCampground,function(err,newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
    
});

// NEW - DISPLAYS FORM TO MAKE A NEW CAMPGROUND
router.get("/new",middleWare.isLoggedIn,function(req,res){
    res.render("campgrounds/new");
});


// SHOW - shows more info about one campground
router.get("/:id",function(req,res){
    // find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
        else {
            console.log(foundCampground);
            // render show template with that campground
            res.render("campgrounds/show",{campground:foundCampground});
        }
    }); 
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit",middleWare.checkCampgroundOwnership ,function(req, res){
    
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id",middleWare.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else {
            // redirect somewhere (show page)
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleWare.checkCampgroundOwnership ,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }
        else {
            res.redirect("/campgrounds");
        }
    })
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;