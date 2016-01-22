// code that is only sent to the client

// subscribe to read data
Meteor.subscribe("documents");
Meteor.subscribe("editingUsers");

// global varibles
var _codemirror_width,_codemirror_height;

//global cache
var cache = {go:{},map:{}};

//dom ready
$(function() {
  // initialization goes here

  _document_height = $(document).height();

  //codemirror initialization
  _codemirror_width = "100%";
  _codemirror_height = "auto";

  // is sidebar docked before before refreshing
  if(!ls.has("isDock")) {
    ls.set("isDock", false);
    console.log("isDock => not set available");
  }
  
});


//////////
///HELPERS
//////////

//doc editors
Template.editor.helpers({
  // get current doc id
  docid:function(){
    setupCurrentDocument();
    return Session.get("docid");
  }, 
  // set up the editor
  config:function(){
    var width = _codemirror_width,
        height = _codemirror_height;
    return function(editor){
      editor.setSize(width, height);
      editor.setOption("autofocus",true);
      editor.setOption("lineNumbers", true);
      editor.setOption("theme", "eclipse");
      editor.setOption("coverGutterNextToScrollbar",true);
      editor.setOption("lineWrapping",true);
      editor.on("change", function(cm_editor, info){
        //$("#viewer").contents().find("html").html(cm_editor.getValue());
        Meteor.call("addEditingUser", Session.get("docid"));
      });

    }
  }, 
});

//editing users
Template.editingUsers.helpers({
  // retrieve a list of users
  users:function(){
    var doc, eusers, users;
    //doc = Documents.findOne({_id:Session.get("docid")});
    doc = findOne(Documents, {_id:Session.get("docid")});
    if (!doc){return;}// give up
    //eusers = EditingUsers.findOne({docid:doc._id});
    eusers = findOne(EditingUsers, {docid:doc._id});
    if (!eusers){return;}// give up
    users = new Array();
    var i = 0;
    for (var user_id in eusers.users){
        users[i] = fixObjectKeys(eusers.users[user_id]);
        i++;
    }
    return users;
  },
  // is doc open
  isDocOpen: function(){
    return Session.get('isDocOpen');
  }
})

//navbar
Template.navbar.helpers({
  // retrieve a list of documents
  documents:function(){
    var username = Meteor.user().username;
    //return Documents.find({createdBy:username});
    return findAll(Documents, {createdBy:username});
  },
  // get doc meta
  document: function(){
    //return Documents.findOne({_id:Session.get("docid")});
    return findOne(Documents, {_id:Session.get("docid")});
  },
  //check 
  isCreatedByCurrentUser: function() {
    var curUser = Meteor.user().username;
    var doc;
    if(cache.map[Session.get("docid")]) {
      doc = cache.map[Session.get("docid")];
      return doc.createdBy == curUser;
    }
   
    //doc = Documents.findOne({_id:Session.get("docid"),createdBy:curUser});
    doc = findOne(Documents, {_id:Session.get("docid"),createdBy:curUser});
    return doc.createdBy == curUser;
  },
  // is doc open
  isDocOpen: function(){
    return Session.get('isDocOpen');
  }
})

//ddcmeta
Template.docMeta.helpers({
  // find current document
  document:function(){
    return findOne(Documents, {_id:Session.get("docid")});
  }, 
  // test if a user is allowed to edit current doc's title/privacy
  canEdit:function(){
    var doc = findOne(Documents, {_id:Session.get("docid")},);
    if (doc){
      if (doc.owner == Meteor.userId()){
        return true;
      }
    }
    return false;
  }
})

Template.editableText.helpers({
    // test if a user is allowed to edit title of current doc
  userCanEdit : function(doc,Collection) {
    // can edit if the current doc is owned by me.
    //doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()});
    doc = findOne(Documents, {_id:Session.get("docid"), owner:Meteor.userId()});
    if (doc){
      return true;
    }
    else {
      return false;
    }
  }    
})

//doclist
Template.docList.helpers({
  // find all public docs
  documents:function(){
    //return Documents.find({isPrivate:false});
    return findAll(Documents, {isPrivate:false});
  }
})

//doclist private
Template.docListPrivate.helpers({
  // find all public/private docs under current user
  documents:function(){
    //return Documents.find({createdBy:Meteor.user().username});
    return findAll(Documents, {createdBy:Meteor.user().username});
  }
})

//sidebar
Template.sidebarFixed.helpers({
  // get online users
  isDocOpen: function(){
    return Session.get('isDocOpen');
  }

});


///////////
/// EVENTS
//////////

Template.navbar.events({
  // add doc
  "click .js-add-doc":function(event){
    event.preventDefault();
    console.log("Add a new doc!");

    if (!Meteor.user()){// user not available
        alert("You need to login first!");
    } else {
      // they are logged in... lets insert a doc
      
      var new_doc_modal = $("#modal-new-doc");
      var input_error = new_doc_modal.find(".add-doc-title-error");
      var input_title = input_error.next();

      if(!input_title.val()) {
        input_error.html("Your document's title is empty");
        return;
      }

      console.log(input_title.val());

      for(var i=0;i<10;i++){
        Meteor.call('testMethod', function(){
          console.log('...');
        });
        console.log('after call');
      }

      var id = Meteor.call("addDoc", input_title.val() ,function(err, res){
        if (!err){// all good
          console.log("event callback received id: "+res);
          Session.set("docid", res); 
        }
      });

      //close modal
      new_doc_modal.modal("hide");
      input_title.val("New Document");
      input_error.html('');   
    }
  },
  // delete doc button
  "click .js-delete-doc":function(event){
    event.preventDefault();
    console.log("deleting...");
    // delete code here

    if (!Meteor.user()){// user not available
        alert("You need to login first!");
    } else {
        var new_doc_modal = $("#modal-delete-doc");
        var docid = Session.get("docid");
        
        if(docid) {
          Meteor.call("deleteDoc",docid, function(err, res){
            if (!err){// all good
              console.log("deleted");
              Session.set("docid", "");
              

            } else {
              console.log("Not deleted");
            }

          });
        }

        new_doc_modal.modal("hide");
        Router.go('/'+Meteor.user().username);
    }
    
  },
  // download doc button
  "click .js-download-doc":function(event){
    event.preventDefault();
    console.log("downloading...");
    // download code here
  },
  // load doc button
  "click .js-load-doc":function(event){
    //console.log(this);
    Session.set("docid", this._id);
  }
})

Template.docMeta.events({
  // change document's privacy
  "click .js-tog-private":function(event){
    event.preventDefault();
    console.log(event.target.checked);
    var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
    Meteor.call("updateDocPrivacy", doc);

  }
})

Template.sidebarFixed.events({
  // dock to full size or back to small size of sidebar
  "click .js-sidebar-dock-left":function(event){
    event.preventDefault();

    //var isDock = Session.get("isDock");
    var isDock = ls.get("isDock");

    dockSideBar(isDock);
  }
});


////////////
/// RENDERED
///////////

//global dom containers
var _container,_sidebar,_navbar,_navbar_height,_container_height,_document_height;

Template.navbar.rendered = function(){
  console.log("sidebar renered");
  // global three containers
  _navbar = $("#custom-nav-bar");

};

Template.sidebarFixed.rendered = function(){
  console.log("sidebar renered");
  // global three containers
  _sidebar = $("#custom-sidebar-fixed-wrap");
    var isDock = ls.get("isDock");
    
    $(document).ready(function () {
      dockSideBar(!isDock);
    });
};

Template.docList.rendered = function(){
  console.log("doclist renered");
  // global three containers
  _container = $("#custom-container");
  var isDock = ls.get("isDock");
    
  $(document).ready(function () {
    dockSideBar(!isDock);
  });

};

Template.docListPrivate.rendered = function(){
  console.log("sdoclistprivate renered");
  // global three containers
  _container = $("#custom-container");
  var isDock = ls.get("isDock");
    
  $(document).ready(function () {
    dockSideBar(!isDock);
  });
  
};

Template.docItem.rendered = function(){
  console.log("docitem renered");
  // global three containers
  _container = $("#custom-container");
  var isDock = ls.get("isDock");
    
  $(document).ready(function () {
    dockSideBar(!isDock);
  });
  
};


function dockSideBar(isDock){

    if(!_container) {
      _container = $("#custom-container");
    }

    if(!_sidebar) {
     _sidebar = $("#custom-sidebar-fixed-wrap");
    }

    var replaceGlyphicon = _sidebar.find(".glyphicon-chevron-right") || _sidebar.find(".glyphicon-chevron-left");
    
    if(isDock) {
      // already docked, remove it
      console.log("undocking...");
      replaceClass(replaceGlyphicon, "glyphicon-chevron-left", "glyphicon-chevron-right");
      setStyle(_sidebar,{"width":"42px"});
      setStyle(_container,{"margin-left":"42px"});

      //Session.set("isDock",false);
      ls.set("isDock",false);

    } else {
      // dock it
      console.log("docking...");
      replaceClass(replaceGlyphicon, "glyphicon-chevron-right", "glyphicon-chevron-left");
      setStyle(_sidebar,{"width":"15%"});
      setStyle(_container,{"margin-left":"15%"});

      //Session.set("isDock",true);
      ls.set("isDock",true);
    }
  
}


// helper to make sure a doc is available
function setupCurrentDocument(){
  var doc;
  console.log("setting up current doc:"+Session.get("docid"));
  if (!Session.get("docid")){// no doc id set yet
    doc = Documents.findOne({});
    if (doc){
      Session.set("docid", doc._id);
    }
  }
}

// helper to remove hyphens from object keys for spacebars.
function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}

// css helpers
function setStyle(ele, prop){
  try{
      $.each(prop, function(p,v){
        ele.css(p,v); // jq
      });
  }catch(e){
    // code => handle here
    console.error("Each eucntion error:"+e);
  }
}

// get computed style
function getStyle(ele, style) {
  try{
    if(!ele) return;
    return style?ele.css(style):ele.css(); //jq
  }catch(e){console.log(e)}
}

function replaceClass(ele, cur, rep, opt){
  if (typeof opt === 'undefined') { opt = {}; }
  try {
    ele.removeClass(cur);
    ele.addClass(rep);
  }catch(e){console.log(e);} 
}

// end css

//localstorage => ls

var ls = {
  cv: function() {
    return (window.localStorage !== undefined && window.JSON !== undefined);
  },
  set: function(k, v) {
    try {
      return (ls.cv()) ? localStorage.setItem(k, JSON.stringify(v)) : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  get: function(k) {
    if (!ls.cv()) {
      return false;
    }
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  remove: function(k) {
    try { 
      localStorage.removeItem(k); 
    } catch(e) {console.error(e);}
  },
  clear: function() {
    try { 
      window.localStorage.clear(); 
    } catch(e) {console.error(e);}
  },
  has: function(p) {
    try { 
      return localStorage.hasOwnProperty(p);
    } catch(e) {
      console.error(e);
      return false;
    }
  }
};

// collections helpers

/** find all query
 **
 ** @param <collection> => collection name
 ** @param <query> => selection criteria to find
 ** @return <json array>
 **
 **/
function findAll(collection, query){
  if(!collection) return;
  if(!query) query = {};
  if('object' != typeof query) return;

  try{
    var resultSet = collection.find(query);
    return resultSet;
  } catch(e){console.log(e);}
}


/** find one query
 **
 ** @param <collection> => collection name
 ** @param <query> => selection criteria to find
 ** @return <json object>
 **
 **/
function findOne(collection, query){
  if(!collection) return;
  if(!query || 'object' != typeof query) return;

  try{
    var resultSet = collection.findOne(query);
    return resultSet;
  } catch(e){console.log(e);}
}

/** remove all query
 **
 ** @param <collection> => collection name
 ** @param <query> => selection criteria to remove
 ** @return <boolean>
 **
 **/
function removeAll(collection, query){
  if(!collection) return;
  if(!query) query = {};
  if('object' != typeof query) return;

  try{
    var isRemoved = collection.remove(query);
    if(isRemoved)
      return true;

    return false;
  } catch(e){console.log(e);}
}

/** remove one query
 **
 ** @param <collection> => collection name
 ** @param <query> => selection criteria to remove
 ** @return <boolean>
 **
 **/
function removeOne(collection, query){
  if(!collection) return;
  if(!query || 'object' != typeof query) return;

  try{
    var isRemoved = collection.remove(query);
    if(isRemoved)
      return true;

    return false;
  } catch(e){console.log(e);}
}
