require('dotenv').config()

const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')
const session = require('express-session')

const app = express()
const port = process.env.PORT || 3000


// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json())
app.use(express.static('public'))

app.use(function(req, res, next) {
  console.log(req.method, req.url)
  next()
})

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
)


// ========================================
// MONGODB
// ========================================

const client = new MongoClient(process.env.MONGODB_URI)

let movies
let users


async function connectToMongoDB() {
  try {
    await client.connect()

    const db = client.db('movieWatchlist')

    movies = db.collection('movies')
    users = db.collection('users')

    // Prevent duplicate usernames
    await users.createIndex(
      { username: 1 },
      { unique: true }
    )

    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}


function getRecommendation(rating) {

  const numberRating = Number(rating)

  if (numberRating >= 8) {
    return 'Must Watch'
  }

  if (numberRating >= 6) {
    return 'Worth Watching'
  }

  return 'Skip'
}


function requireLogin(req, res, next) {

  if (!req.session.username) {

    return res.status(401).json({
      error: 'You must be logged in.'
    })

  }

  next()
}


app.post('/api/register', async function(req, res) {

  try {

    const username = String(req.body.username || '').trim()
    const password = String(req.body.password || '')


    if (!username || !password) {

      return res.status(400).json({
        error: 'Username and password are required.'
      })

    }


    const existingUser = await users.findOne({
      username: username
    })


    if (existingUser) {

      return res.status(400).json({
        error: 'Username already exists.'
      })

    }


    const hashedPassword = await bcrypt.hash(password, 10)


    await users.insertOne({
      username: username,
      password: hashedPassword
    })

    req.session.username = username


    res.json({
      message: 'Account created.',
      username: username
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: 'Could not create account.'
    })

  }

})


app.post('/api/login', async function(req, res) {

  try {

    const username = String(req.body.username || '').trim()
    const password = String(req.body.password || '')


    if (!username || !password) {

      return res.status(400).json({
        error: 'Username and password are required.'
      })

    }


    const user = await users.findOne({
      username: username
    })


    if (!user) {

      return res.status(401).json({
        error: 'Invalid username or password.'
      })

    }


    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    )


    if (!passwordMatches) {

      return res.status(401).json({
        error: 'Invalid username or password.'
      })

    }


    req.session.username = username


    res.json({
      message: 'Logged in.',
      username: username
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: 'Could not log in.'
    })

  }

})


app.post('/api/logout', function(req, res) {

  req.session.destroy(function(error) {

    if (error) {

      return res.status(500).json({
        error: 'Could not log out.'
      })

    }


    res.json({
      message: 'Logged out.'
    })

  })

})


app.get('/api/user', function(req, res) {

  if (!req.session.username) {

    return res.status(401).json({
      loggedIn: false
    })

  }


  res.json({
    loggedIn: true,
    username: req.session.username
  })

})

app.get(
  '/api/movies',
  requireLogin,
  async function(req, res) {

    try {

      const appdata = await movies
        .find({
          username: req.session.username
        })
        .toArray()


      res.json(appdata)

    } catch (error) {

      console.error(error)

      res.status(500).json({
        error: 'Could not get movies.'
      })

    }

  }
)


app.post(
  '/api/movies',
  requireLogin,
  async function(req, res) {

    try {

      const incomingData = req.body


      const newMovie = {

        movie: incomingData.movie,

        genre: incomingData.genre,

        rating: Number(incomingData.rating),

        recommendation:
          getRecommendation(incomingData.rating),

        username: req.session.username

      }


      await movies.insertOne(newMovie)


      const appdata = await movies
        .find({
          username: req.session.username
        })
        .toArray()


      res.json(appdata)

    } catch (error) {

      console.error(error)

      res.status(500).json({
        error: 'Could not add movie.'
      })

    }

  }
)


app.put(
  '/api/movies/:id',
  requireLogin,
  async function(req, res) {

    try {

      const id = req.params.id


      if (!ObjectId.isValid(id)) {

        return res.status(400).json({
          error: 'Invalid movie ID.'
        })

      }


      const result = await movies.updateOne(

        {
          _id: new ObjectId(id),

          username: req.session.username
        },

        {
          $set: {

            movie: req.body.movie,

            genre: req.body.genre,

            rating: Number(req.body.rating),

            recommendation:
              getRecommendation(req.body.rating)

          }
        }

      )


      if (result.matchedCount === 0) {

        return res.status(404).json({
          error: 'Movie not found.'
        })

      }


      const appdata = await movies
        .find({
          username: req.session.username
        })
        .toArray()


      res.json(appdata)

    } catch (error) {

      console.error(error)

      res.status(500).json({
        error: 'Could not update movie.'
      })

    }

  }
)


app.delete(
  '/api/movies/:id',
  requireLogin,
  async function(req, res) {

    try {

      const id = req.params.id


      if (!ObjectId.isValid(id)) {

        return res.status(400).json({
          error: 'Invalid movie ID.'
        })

      }


      const result = await movies.deleteOne({

        _id: new ObjectId(id),

        username: req.session.username

      })


      if (result.deletedCount === 0) {

        return res.status(404).json({
          error: 'Movie not found.'
        })

      }


      const appdata = await movies
        .find({
          username: req.session.username
        })
        .toArray()


      res.json(appdata)

    } catch (error) {

      console.error(error)

      res.status(500).json({
        error: 'Could not delete movie.'
      })

    }

  }
)

app.delete(
  '/api/movies',
  requireLogin,
  async function(req, res) {

    try {

      await movies.deleteMany({
        username: req.session.username
      })


      res.json([])

    } catch (error) {

      console.error(error)

      res.status(500).json({
        error: 'Could not clear movies.'
      })

    }

  }
)

connectToMongoDB()
  .then(function() {

    app.listen(port, function() {

      console.log(
        'Server running on port ' + port
      )

    })

  })
  .catch(function(error) {

    console.error(
      'Server could not start:',
      error
    )

  })