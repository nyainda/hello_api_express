function validateRegistration(req, res, next) {
    const { firstName, lastName, email, password } = req.body;
    const errors = [];
  
    if (!firstName) errors.push({ field: 'firstName', message: 'First name is required' });
    if (!lastName) errors.push({ field: 'lastName', message: 'Last name is required' });
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });
  
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
  
    next();
  }
  
  function validateLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];
  
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });
  
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
  
    next();
  }
  
  function validateOrganisation(req, res, next) {
    const { name } = req.body;
    const errors = [];
  
    if (!name) errors.push({ field: 'name', message: 'Organisation name is required' });
  
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }
  
    next();
  }
  
  module.exports = { validateRegistration, validateLogin, validateOrganisation };