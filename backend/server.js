const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

let Exercise = require('./exercise.model');
let User = require('./user.model');

app.use(cors());
app.use(bodyParser.json());

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

const exerciseRoutes = express.Router();
const userRoutes = express.Router();

exerciseRoutes.route('/').get((req, res) => {
    Exercise.find((err, exercises) => {
        if (err) {
            console.log(err);
        } else {
            res.json(exercises);
        }
    });
});

exerciseRoutes.route('/:id').get((req, res) => {
    let id = req.params.id;
    Exercise.findById(id, (err, exercise) => {
        res.json(exercise);
    });
});

exerciseRoutes.route('/:id').delete((req, res) => {
    let id = req.params.id;
    Exercise.findByIdAndDelete(id, (err) => {
        if (err) {
            res.json('Exercise not found: ' + err);
        } else {
            res.json('Exercise deleted:' + id);
        }
    });
});

exerciseRoutes.route('/update/:id').post((req, res) => {
    Exercise.findById(req.params.id, (err, exercise) => {
        if (!exercise) {
            res.status(404).send("data is not found");
        } else {
            exercise.username = req.body.username;
            exercise.description = req.body.description;
            exercise.duration = req.body.duration;
            exercise.date = req.body.date;

            exercise.save().then(exercise => {
                res.json('Exercise updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

exerciseRoutes.route('/add').post((req, res) => {
    const username = req.body.username;
    const description = req.body.description;
    const duration = Number(req.body.duration);
    const date = Date.parse(req.body.date);

    const newExercise = new Exercise({
        username,
        description,
        duration,
        date,
    });

    newExercise.save((errSave, data) => {
        if (errSave) {
            res.send('Error occurred while saving exercise');
        } else {
            res.json(data);
        }
    });
});

userRoutes.route('/').get((req, res) => {
    User.find((err, users) => {
        if (err) {
            console.log(err);
        } else {
            res.json(users);
        }
    });
});

userRoutes.route('/add').post((req, res) => {
    const username = req.body.username;
  
    if (username === '') {
      res.send('Username cannot be blank');
    } else {
      const newUser = new User({
        username,
      });
  
      newUser.save((err, data) => {
        if (err) {
          if (err.name === 'MongoError' && err.code === 11000) { // Duplicate key error
            res.send('Duplicate username, try a different username');
          } else {
            res.send('Error pccurred while saving user');
          }
        } else {
          res.json(data);
        }
      });
    }
  });

app.use('/exercises', exerciseRoutes);
app.use('/users', userRoutes);

app.listen(port, () => {
    console.log("Server is running on Port: " + port);
});