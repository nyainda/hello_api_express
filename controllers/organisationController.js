const Organisation = require('../models/Organisation');

exports.getAllOrganisations = async (req, res) => {
  try {
    const organisations = await Organisation.findByUserId(req.user.userId);

    res.json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations,
      },
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.createOrganisation = async (req, res) => {
  const { name, description } = req.body;

  try {
    const org = await Organisation.create(name, description);
    await Organisation.addUser(org.org_id, req.user.userId);

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: org,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400,
    });
  }
};

exports.addUserToOrganisation = async (req, res) => {
  const { userId } = req.body;

  try {
    await Organisation.addUser(req.params.orgId, userId);

    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400,
    });
  }
};