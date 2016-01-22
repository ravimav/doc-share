
/////////
///ROUTING
////////

// set up the iron router
Router.configure({
  layoutTemplate: 'ApplicationLayout',
});

// applying plugins by iron router
Router.plugin('dataNotFound', {
  notFoundTemplate: 'notFound', 
  except: ['homepage.show']
});


///////////////
///client routes
///////////////

// 'home' page
Router.route('/', {
  name:'homepage.show',
  path: '/',
  yieldRegions: {
    'navbar': {to: 'header'},
    'sidebarFixed': {to: 'sidebar'},
    'docList':{to: 'main'}
  },
  onBeforeAction: function () {
    Session.set("isDocOpen", false);
    this.next();
  },
  action: function () {
    this.render();
    
    console.log("you hit / ");
  }
});

//empty-1
Router.route('/:createdBy/doc/',{
  name: '404_1',
  action: function(){
    this.redirect('/');
  }
});

//empty-2
Router.route('//',{
  name: '404_2',
  action: function(){
    this.redirect('/');
  }
});

// individual document page
Router.route('/:createdBy/doc/:_id', {
  name: 'document.show',
  path: '/:createdBy/doc/:_id',
  yieldRegions: {
    'navbar': {to: 'header'},
    'sidebarFixed': {to: 'sidebar'},
    'docItem':{to: 'main'}
  },
  data: function () {
    return Documents.findOne({_id: this.params._id});;
  },
  onBeforeAction: function () {
    Session.set("isDocOpen", true);
    Session.set("docid", this.params._id);
    this.next();
  },
  action: function () {
    this.render();
    
    console.log("you hit /doc/id  "+this.params._id);

    // is sidebar docked before before refreshing
    if(!ls.has("isDock")) {
      ls.set("isDock", false);
      console.log("isDock => not available");
    }
  }
});

// list of docs under current user
Router.route('/:createdBy', {
  name: 'user.show',
  path: '/:createdBy',
  yieldRegions: {
    'navbar': {to: 'header'},
    'sidebarFixed': {to: 'sidebar'},
    'docListPrivate':{to: 'main'}
  },
  onBeforeAction: function () {
    Session.set("isDocOpen", false);
    this.next();
  },
  action: function () {
    this.render();
    
    console.log("you hit /user  "+this.params._id);

    // is sidebar docked before before refreshing
    if(!ls.has("isDock")) {
      ls.set("isDock", false);
      console.log("isDock => not available");
    }
  }

});