var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Yanagi-ni-Tsubame',
  						isLogin: req.session.isLogin,
  						user: req.session.user });
});

module.exports = router;
