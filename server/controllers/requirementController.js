import { requirementBackendService } from '../services/requirementBackendService.js';

export const createRequirementHandler = async (req, res) => {
  try {
    // Ownership check: Ensure buyer cannot impersonate another user if req.user is set
    if (req.user && req.user.uid !== req.body.buyerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot post requirements on behalf of another user',
        errors: [{ field: 'buyerId', message: 'Caller ID does not match buyerId' }]
      });
    }

    const created = await requirementBackendService.createRequirement(req.body);

    return res.status(201).json({
      success: true,
      message: 'Requirement created successfully',
      data: created
    });
  } catch (error) {
    console.error('Error creating requirement:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating requirement',
      error: error.message
    });
  }
};
