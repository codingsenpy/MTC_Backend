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
    
    // Get activity counts by action type with readable descriptions
    const actionStats = await AdminActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Map action codes to readable descriptions
    const formattedActionStats = actionStats.map(stat => ({
      action: getActionDescription(stat._id),
      count: stat.count
    }));

    // Get activity counts by admin with populated admin details
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
          as: 'adminDetails'
        }
      },
      {
        $unwind: '$adminDetails'
      },
      {
        $group: {
          _id: '$adminId',
          adminName: { $first: '$adminDetails.name' },
          adminEmail: { $first: '$adminDetails.email' },
          activities: { $sum: 1 }
        }
      },
      {
        $sort: { activities: -1 }
      }
    ]);

    // Format admin stats to be more readable
    const formattedAdminStats = adminStats.map(stat => ({
      adminName: stat.adminName,
      adminEmail: stat.adminEmail,
      totalActivities: stat.activities
    }));
    
    // Get daily activity counts with better date formatting
    const dailyStats = await AdminActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
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
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format daily stats with better date presentation
    const formattedDailyStats = dailyStats.map(stat => ({
      date: new Date(stat._id).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      activities: stat.count
    }));
    
    res.json({
      success: true,
      data: {
        actionStatistics: formattedActionStats,
        adminStatistics: formattedAdminStats,
        dailyStatistics: formattedDailyStats,
        period: `Last ${days} days`
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