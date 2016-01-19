// code sent to client and server
// which gets loaded before anything else (since it is in the lib folder)

this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");
