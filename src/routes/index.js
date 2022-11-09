
module.exports = (app) => {
  require('./user')(app),
  require('./admin')(app)
}