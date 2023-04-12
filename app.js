const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
// const date=require(__dirname+"/date.js");
const _=require("lodash");



const app=express();
 //const items=["Buy Food","Cook Food","Eat Food"];//it's possible to push elements in array if its declared const
 let workItems=[];

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ritwiza2002:RQ2g3gcfJARMnYeh@cluster0.tuvdjjz.mongodb.net/todolistDB",{useNewUrlParser:true, useUnifiedTopology:true,useFindAndModify: false })
const itemSchema={
    name:String
};

const Item=mongoose.model("Item", itemSchema);

const item1=new Item({
    name: "Welcome to your todolist!"
});

const item2=new Item({
    name: "Second part"
});

const item3=new Item({
    name: "Third part"
});
const defaultItems=[item1, item2, item3];

const listSchema={
    name:String,
    items: [itemSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/",function(req,res){
    
    // let day=date.getDay();
    Item.find({},function(err,foundItems){
if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Successfully saved default items to DB.");
    }
  res.redirect("/");
});
}else{
    res.render("list",{listTitle:"Today", newListItems:foundItems}); 
}
       
    });
   
    
});
app.get("/:customListName",function(req,res){
    //console.log(req.params.customListName);
    const customListName=_.capitalize(req.params.customListName);

List.findOne({name: customListName},function(err,foundList){
    if(!err){
        if(!foundList){
            //console.log("Not exist");
            const list=new List({
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }else{
            //console.log("exists");
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items})
        }
    }
});

    
});

app.post("/",function(req,res){
   
 const itemName=req.body.newItem;
 const listName=req.body.list;
 const item=new Item({
  name:itemName  
 });

 if(listName==="Today"){
    item.save();
    res.redirect("/"); 
 }else{
    List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    });
 }
 
//  if(req.body.list==="Work"){
//     workItems.push(item);
//     res.redirect("/work")
//  }else{
//   items.push(item);
//  res.redirect("/");
 //console.log(item);
 //}
});

// app.get("/work",function(req,res){
//     res.render("list",{listTitle:"Work List",newListItems:workItems});
// });


app.post("/work",function(req,res){
   
    let item=req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});
app.get("/about",function(req,res){
    res.render("about");
});

app.post("/delete",function(req,res){
   const checkedItemId= req.body.checkbox;
   const listName=req.body.listName;

   if(listName==="Today"){

    Item.findByIdAndRemove(checkedItemId,function(err){
        if(!err){
            console.log("Succesfully deleted");
            res.redirect("/");
        }
       });
   }else{
   List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
if(!err){
    res.redirect("/"+listName);
}
   });   
   }

});

let port=process.env.PORT;
if(port == null || port==""){
    port=3000;
}
//app.listen(port);


app.listen(port, function(){
    console.log("Server started successfully");
});