db = db.getSiblingDB("Tuki-FoodStore");

db.createUser({
  user: "Tuki-Root",
  pwd: "123",
  roles: [
    { role: "readWrite", db: "Tuki-FoodStore" }
  ]
});
