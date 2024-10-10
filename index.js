const express = require("express");
const app = express();
const { vehicles: _ } = require("./db");
const multer = require("multer");
const { randomUUID } = require("node:crypto");
const cors = require("cors");

const PORT = 3333;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}_${String(file.originalname).replace(" ", "_")}`);
  },
});
const upload = multer({ storage });

let vehicles = _;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true,
  })
);

app.get("/cars", (req, res, next) => {
  return res.status(200).json({ vehicles });
});

app.get("/cars/:id", (req, res, next) => {
  const [vehicle] = vehicles.filter((v) => v.id === Number(req.params.id));
  if (vehicle) return res.status(200).json({ vehicle });
  return res.status(404).json({ msg: "Not Found" });
});

app.post("/cars", upload.single("thumbnail"), (req, res, next) => {
  const { mark, model, year, engine_capacity } = req.body;
  if (!mark || !model || !year || !engine_capacity)
    return res.status(400).json({ msg: "Invalid Schema Body" });
  const vehicle = {
    id: vehicles.length + 1,
    mark,
    model,
    year,
    engine_capacity,
    thumb: req.file.filename,
  };
  vehicles = [...vehicles, vehicle];
  return res.status(201).json({ vehicle });
});

app.put("/cars/:id", upload.single("thumbnail"), (req, res, next) => {
  console.log(req.file);
  const vehicle = vehicles.filter((v) => v.id === Number(req.params.id));
  if (vehicle.length === 0 || !vehicle)
    res.status(404).json({ msg: "Not Found" });
  const { mark, model, year, engine_capacity } = req.body;
  vehicles = vehicles.map((v) => {
    if (v.id === Number(req.params.id)) {
      return {
        id: v.id,
        mark: mark ? mark : v.mark,
        model: model ? model : v.model,
        year: year ? year : v.year,
        engine_capacity: engine_capacity ? engine_capacity : v.engine_capacity,
        thumb: req.file ? req.file.filename : v.thumb,
      };
    }
    return v;
  });
  return res.status(201).json({
    vehicle: vehicles.filter((v) => v.id === Number(req.params.id))[0],
  });
});

app.delete("/cars/:id", (req, res, next) => {
  const vehicle = vehicles.filter((v) => v.id === Number(req.params.id));
  vehicles = vehicles.filter((v) => v.id !== Number(req.params.id));
  if (vehicle.length === 0) {
    return res.status(404).json({ msg: "Not Found" });
  }
  return res.status(201).json({ vehicle });
});

app.listen(PORT, () => {
  console.log(`APIs Runnig On http://localhost:${PORT}`);
});
