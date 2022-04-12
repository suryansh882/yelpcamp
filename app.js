var express     =   require('express'),
    app         =   express(),
    bodyParser  =   require('body-parser'),
    mongoose    =   require('mongoose'),
    flash       =   require("connect-flash"),
    passport    =   require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride= require("method-override"),
    Campground  =   require("./models/campground"),
    Comment     =   require("./models/comment"),
    User        =   require("./models/user"),
    seedDB      =   require("./seeds");

// requiring routes
var commentRoutes= require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017",{useNewUrlParser:true,useUnifiedTopology:true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// seedDB();    // seed the database

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser=req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use("/",indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`YelpCamp Server has started! ${port}`);
})

// app.listen(3000,function(){ 
//     console.log("YelpCamp Server has started!");
// });