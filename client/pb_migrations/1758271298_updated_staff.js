/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2301119865")

  // update collection data
  unmarshal({
    "name": "staffs"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2301119865")

  // update collection data
  unmarshal({
    "name": "staff"
  }, collection)

  return app.save(collection)
})
