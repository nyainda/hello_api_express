const Organisation = require('../models/Organisation');

exports.getAllOrganisations = async (req, res) => {
  try {
    const organisations = await Organisation.findByUserId(req.user.userId);
    res.json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations },
    });
  } catch (error) {
    console.error('Error retrieving organisations:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.getOrganisation = async (req, res) => {
  try {
    const org = await Organisation.findById(req.params.orgId);
    if (!org) {
      return res.status(404).json({ status: 'error', message: 'Organisation not found' });
    }
    res.json({
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: org,
    });
  } catch (error) {
    console.error('Error retrieving organisation:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.createOrganisation = async (req, res) => {
  const { name, description } = req.body;
  
  // Input validation
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Organisation name is required' });
  }

  try {
    const org = await Organisation.create(name, description);
    await Organisation.addUser(org.org_id, req.user.userId);
    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: org,
    });
  } catch (error) {
    console.error('Error creating organisation:', error);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create organisation',
      details: error.message,
    });
  }
};

exports.addUserToOrganisation = async (req, res) => {
  const { userId } = req.body;
  const { orgId } = req.params;

  // Input validation
  if (!userId || !orgId) {
    return res.status(400).json({ status: 'error', message: 'User ID and Organisation ID are required' });
  }

  try {
    // Check if user is already in the organization
    const isUserInOrg = await Organisation.hasUser(orgId, userId);
    if (isUserInOrg) {
      return res.status(400).json({ status: 'error', message: 'User is already in the organisation' });
    }

    await Organisation.addUser(orgId, userId);
    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    console.error('Error adding user to organisation:', error);
    res.status(500).json({  // Changed from 400 to 500 for server errors
      status: 'error',
      message: 'Failed to add user to organisation',
      details: error.message,
    });
  }
};