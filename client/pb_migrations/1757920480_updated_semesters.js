/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708049880")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text99198227",
    "max": 0,
    "min": 0,
    "name": "semesterName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "date852890233",
    "max": "",
    "min": "",
    "name": "semesterEndDate",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "date3616419707",
    "max": "",
    "min": "",
    "name": "semesterStartDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3494172116",
    "max": 0,
    "min": 0,
    "name": "session",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool2063623452",
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708049880")

  // remove field
  collection.fields.removeById("text99198227")

  // remove field
  collection.fields.removeById("date852890233")

  // remove field
  collection.fields.removeById("date3616419707")

  // remove field
  collection.fields.removeById("text3494172116")

  // remove field
  collection.fields.removeById("bool2063623452")

  return app.save(collection)
})
