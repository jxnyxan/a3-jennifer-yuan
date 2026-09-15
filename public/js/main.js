document.addEventListener('DOMContentLoaded', function() {

  console.log('main.js loaded')


  const registerForm = document.querySelector('#register-form')
  const loginForm = document.querySelector('#login-form')

  const registerUsername = document.querySelector('#register-username')
  const registerPassword = document.querySelector('#register-password')

  const loginUsername = document.querySelector('#login-username')
  const loginPassword = document.querySelector('#login-password')

  const authSection = document.querySelector('#auth-section')
  const authMessage = document.querySelector('#auth-message')

  const userSection = document.querySelector('#user-section')
  const currentUser = document.querySelector('#current-user')
  const logoutButton = document.querySelector('#logout-button')

  const movieApp = document.querySelector('#movie-app')


  const form = document.querySelector('#movie-form')
  const results = document.querySelector('#movie-results')

  const movieInput = document.querySelector('#movie')
  const genreInput = document.querySelector('#genre')
  const ratingInput = document.querySelector('#rating')

  const movieIdInput = document.querySelector('#movie-id')

  const submitButton = document.querySelector('#submit-button')
  const cancelButton = document.querySelector('#cancel-button')

  const movieCount = document.querySelector('#movie-count')
  const message = document.querySelector('#message')


  function showLoggedIn(username) {

    currentUser.textContent = username

    authSection.classList.add('hidden')
    userSection.classList.remove('hidden')
    movieApp.classList.remove('hidden')

    authMessage.textContent = ''

    getMovies()
  }


  function showLoggedOut() {

    authSection.classList.remove('hidden')
    userSection.classList.add('hidden')
    movieApp.classList.add('hidden')

    currentUser.textContent = ''

    results.innerHTML = ''
    movieCount.textContent = '0 movies'
  }

  async function checkLogin() {

    try {

      const response = await fetch('/api/user')

      if (!response.ok) {
        showLoggedOut()
        return
      }

      const data = await response.json()

      showLoggedIn(data.username)

    } catch (error) {

      console.error('Check login error:', error)

      showLoggedOut()
    }
  }


  registerForm.addEventListener('submit', async function(event) {

    event.preventDefault()

    console.log('Register button clicked')

    authMessage.textContent = 'Creating account...'

    const username = registerUsername.value.trim()
    const password = registerPassword.value


    if (!username || !password) {

      authMessage.textContent =
        'Please enter a username and password.'

      return
    }


    try {

      const response = await fetch('/api/register', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          username: username,
          password: password
        })

      })


      const data = await response.json()


      if (!response.ok) {

        authMessage.textContent =
          data.error || 'Could not create account.'

        return
      }


      console.log('Account created:', data.username)

      registerForm.reset()

      showLoggedIn(data.username)


    } catch (error) {

      console.error('Registration error:', error)

      authMessage.textContent =
        'Could not connect to the server.'

    }

  })


  loginForm.addEventListener('submit', async function(event) {

    event.preventDefault()

    console.log('Login button clicked')

    authMessage.textContent = 'Logging in...'


    const username = loginUsername.value.trim()
    const password = loginPassword.value


    if (!username || !password) {

      authMessage.textContent =
        'Please enter a username and password.'

      return
    }


    try {

      const response = await fetch('/api/login', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          username: username,
          password: password
        })

      })


      const data = await response.json()


      if (!response.ok) {

        authMessage.textContent =
          data.error || 'Could not log in.'

        return
      }


      console.log('Logged in:', data.username)

      loginForm.reset()

      showLoggedIn(data.username)


    } catch (error) {

      console.error('Login error:', error)

      authMessage.textContent =
        'Could not connect to the server.'

    }

  })


  logoutButton.addEventListener('click', async function() {

    try {

      const response = await fetch('/api/logout', {
        method: 'POST'
      })


      if (!response.ok) {

        authMessage.textContent =
          'Could not log out.'

        return
      }


      resetForm()

      showLoggedOut()

      authMessage.textContent =
        'Logged out.'


    } catch (error) {

      console.error('Logout error:', error)

      authMessage.textContent =
        'Could not connect to the server.'

    }

  })

  function displayMovies(movies) {

    results.innerHTML = ''


    movies.forEach(function(movie) {

      const row = document.createElement('tr')


      row.innerHTML = `
        <td>${movie.movie}</td>

        <td>${movie.genre}</td>

        <td>${movie.rating}/10</td>

        <td>${movie.recommendation}</td>

        <td class="actions">

          <button
            class="edit-button small-button"
            data-id="${movie._id}"
          >
            Edit
          </button>

          <button
            class="delete-button small-button"
            data-id="${movie._id}"
          >
            Delete
          </button>

        </td>
      `


      results.appendChild(row)

    })


    if (movies.length === 0) {

      const row = document.createElement('tr')

      row.innerHTML = `
        <td
          colspan="5"
          class="empty-state"
        >
          No movies yet. Add your first movie!
        </td>
      `

      results.appendChild(row)

    }


    if (movies.length === 1) {

      movieCount.textContent = '1 movie'

    } else {

      movieCount.textContent =
        movies.length + ' movies'

    }

  }


  async function getMovies() {

    try {

      const response = await fetch('/api/movies')


      if (response.status === 401) {

        showLoggedOut()

        return
      }


      const data = await response.json()


      if (!response.ok) {

        message.textContent =
          data.error || 'Could not load movies.'

        return
      }


      displayMovies(data)


    } catch (error) {

      console.error('Get movies error:', error)

      message.textContent =
        'Could not connect to the server.'

    }

  }


  form.addEventListener('submit', async function(event) {

    event.preventDefault()


    const movieData = {

      movie: movieInput.value.trim(),

      genre: genreInput.value,

      rating: Number(ratingInput.value)

    }


    const editingId = movieIdInput.value


    try {

      let response


      if (editingId) {

        response = await fetch(
          '/api/movies/' + editingId,
          {

            method: 'PUT',

            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify(movieData)

          }
        )

      }


  

      else {

        response = await fetch(
          '/api/movies',
          {

            method: 'POST',

            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify(movieData)

          }
        )

      }


      const data = await response.json()


      if (response.status === 401) {

        showLoggedOut()

        return
      }


      if (!response.ok) {

        message.textContent =
          data.error || 'Could not save movie.'

        return
      }


      displayMovies(data)


      if (editingId) {

        message.textContent =
          'Movie updated.'

      } else {

        message.textContent =
          'Movie added.'

      }


      resetForm()


    } catch (error) {

      console.error('Save movie error:', error)

      message.textContent =
        'Could not connect to the server.'

    }

  })


  results.addEventListener('click', async function(event) {


    if (
      event.target.classList.contains(
        'delete-button'
      )
    ) {

      const id = event.target.dataset.id


      try {

        const response = await fetch(
          '/api/movies/' + id,
          {
            method: 'DELETE'
          }
        )


        const data = await response.json()


        if (response.status === 401) {

          showLoggedOut()

          return
        }


        if (!response.ok) {

          message.textContent =
            data.error || 'Could not delete movie.'

          return
        }


        displayMovies(data)

        message.textContent =
          'Movie deleted.'


      } catch (error) {

        console.error('Delete movie error:', error)

        message.textContent =
          'Could not connect to the server.'

      }

    }

    if (
      event.target.classList.contains(
        'edit-button'
      )
    ) {

      const row = event.target.closest('tr')

      const cells = row.querySelectorAll('td')


      movieInput.value =
        cells[0].textContent.trim()

      genreInput.value =
        cells[1].textContent.trim()

      ratingInput.value =
        cells[2]
          .textContent
          .replace('/10', '')
          .trim()


      movieIdInput.value =
        event.target.dataset.id


      submitButton.textContent =
        'Save Changes'

      cancelButton.classList.remove(
        'hidden'
      )

      message.textContent =
        'Editing movie.'

    }

  })

  cancelButton.addEventListener('click', function() {

    resetForm()

    message.textContent =
      'Edit canceled.'

  })


  function resetForm() {

    form.reset()

    movieIdInput.value = ''

    submitButton.textContent =
      'Add Movie'

    cancelButton.classList.add(
      'hidden'
    )

  }


  checkLogin()

})