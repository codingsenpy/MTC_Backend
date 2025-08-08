import AdminActivity from '../models/AdminActivity.js';

// @desc    Get recent admin activities
// @route   GET /api/admin/activities
// @access  Admin only
export const getAdminActivities = async (req, res) => {
  try {
    const { limit = 50, page = 1, adminId, action, targetType } = req.query;
    
    // Build filter object
    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;
    
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get activities with pagination
    const activities = await AdminActivity.find(filter)
      .populate('adminId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    // Get total count for pagination info
    const totalCount = await AdminActivity.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get activity statistics
// @route   GET /api/admin/activities/stats
// @access  Admin only
export const getActivityStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get activity counts with full details
    const actionStats = await AdminActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: 'adminId',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $lookup: {
          from: 'tutors',
          localField: 'targetId',
          foreignField: '_id',
          as: 'tutor'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'targetId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'centers',
          localField: 'targetId',
          foreignField: '_id',
          as: 'center'
        }
      },
      {
        $project: {
          action: 1,
          timestamp: 1,
          adminName: { $arrayElemAt: ['$admin.name', 0] },
          targetDetails: {
            $cond: {
              if: { $eq: ['$targetType', 'tutor'] },
              then: { $arrayElemAt: ['$tutor.name', 0] },
              else: {
                $cond: {
                  if: { $eq: ['$targetType', 'student'] },
                  then: { $arrayElemAt: ['$student.name', 0] },
                  else: {
                    $cond: {
                      if: { $eq: ['$targetType', 'center'] },
                      then: { $arrayElemAt: ['$center.name', 0] },
                      else: null
                    }
                  }
                }
              }
            }
          },
          targetType: 1,
          details: 1
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          activities: {
            $push: {
              admin: '$adminName',
              target: '$targetDetails',
              targetType: '$targetType',
              timestamp: '$timestamp',
              details: '$details'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          action: '$_id',
          count: 1,
          activities: { $slice: ['$activities', 5] } // Show last 5 activities for each action
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get activity counts by admin with details
    const adminStats = await AdminActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: 'adminId',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $unwind: '$admin'
      },
      {
        $group: {
          _id: '$adminId',
          adminName: { $first: '$admin.name' },
          adminEmail: { $first: '$admin.email' },
          totalActions: { $sum: 1 },
          actionBreakdown: {
            $push: {
              action: '$action',
              timestamp: '$timestamp',
              details: '$details'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          adminName: 1,
          adminEmail: 1,
          totalActions: 1,
          recentActivities: { $slice: ['$actionBreakdown', 5] } // Show last 5 activities
        }
      },
      {
        $sort: { totalActions: -1 }
      }
    ]);
    
    // Get daily activity counts with details
    const dailyStats = await AdminActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: 'adminId',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 },
          activities: {
            $push: {
              action: '$action',
              admin: { $arrayElemAt: ['$admin.name', 0] },
              timestamp: '$timestamp',
              details: '$details'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalActivities: '$count',
          topActivities: { $slice: ['$activities', 5] } // Show top 5 activities per day
        }
      },
      {
        $sort: { date: -1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        actionStats,
        adminStats,
        dailyStats,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export default { getAdminActivities, getActivityStats };