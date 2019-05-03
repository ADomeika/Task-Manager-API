const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should sign up a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Adomas',
      email: 'adomas@example.com',
      password: 'MyPass987!'
    })
    .expect(201)

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Adomas',
      email: 'adomas@example.com'
    },
    token: user.tokens[0].token
  })
  expect(user.password).not.toBe('MyPass987!')
})

test('should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200)

  const user = await User.findById(response.body.user._id)
  expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login nonexistent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: 'whatever123'
    })
    .expect(400)
})

test('should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('should not delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('should upload avatar image', async () => {
  await request(app)
    .patch('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Atom'
    })
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.name).toBe('Atom')
})

test('should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Leeds'
    })
    .expect(400)
})

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated
