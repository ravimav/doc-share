// code that is only sent to the server. 

Meteor.startup(function () {
  // create a starter doc if you want
  // do something what you want at start up
  
});


// publish read access to collections

// all public/private visible docs 
Meteor.publish("documents", function(){
  return Documents.find({
   $or:[
    {isPrivate:{$ne:true}}, 
    {owner:this.userId}
    ] 
  });
})  
// users editing docs
Meteor.publish("editingUsers", function(){
  return EditingUsers.find();
})