const express = require('express') ;

const router = express.Router() ;

const relableController = require('../controllers/relabel') ; 

router.post("/fix", relableController.postRelableFix)


module.exports = router ;