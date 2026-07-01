const prisma = require('../config/db');
const emailService = require('../services/emailService');

async function getOrInitializeTrial(userId, email, currentPlan) {
  if (currentPlan === 'Premium') {
    return {
      planType: 'Premium',
      trialUsed: true
    };
  }

  const numericId = userId && !isNaN(userId) ? parseInt(userId, 10) : null;
  if (!numericId) return null;

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: numericId }
    });
    
    if (!sub) return null;

    // Check & activate trial
    if (sub.planType === 'Basic' && !sub.trialUsed) {
      const now = new Date();
      const expires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      
      const updatedSub = await prisma.subscription.update({
        where: { userId: numericId },
        data: {
          planType: 'Trial Premium',
          status: 'active',
          trialStartedAt: now,
          trialExpiresAt: expires,
          trialUsed: true
        }
      });
      console.log(`[Premium Trial] Activated 3-day trial in Prisma for user ${numericId}`);

      // Send trialStarted email
      await emailService.sendEmail('trialStarted', email, null, {
        NAME: email.split('@')[0]
      });

      return updatedSub;
    }

    // Downgrade trial check
    if (sub.planType === 'Trial Premium') {
      const now = new Date();
      if (sub.trialExpiresAt && now > sub.trialExpiresAt) {
        const updatedSub = await prisma.subscription.update({
          where: { userId: numericId },
          data: {
            planType: 'Basic',
            status: 'expired'
          }
        });
        console.log(`[Premium Trial] Prisma Trial expired for user ${numericId}. Downgraded to Basic.`);
        return updatedSub;
      }
    }

    return sub;
  } catch (err) {
    console.error('[premium-trial] Failed database query:', err.message);
    return null;
  }
}

async function getProfile(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Handle Coupon user check
    if (user.is_coupon) {
      return res.status(200).json({
        id: user.id,
        email: user.email,
        full_name: user.name,
        date_of_birth: 'Not Available',
        gender: 'Not Available',
        profession: 'Not Available',
        plan_type: 'Premium',
        is_coupon: true
      });
    }

    const numericId = parseInt(user.id, 10);
    const dbUser = await prisma.user.findUnique({
      where: { id: numericId },
      include: { subscription: true }
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Check trial
    let currentPlan = dbUser.subscription ? dbUser.subscription.planType : 'Basic';
    const trialSub = await getOrInitializeTrial(dbUser.id, dbUser.email, currentPlan);

    const mergedProfile = {
      id: dbUser.id.toString(),
      email: dbUser.email,
      full_name: dbUser.fullName || '',
      date_of_birth: dbUser.dateOfBirth || '',
      gender: dbUser.gender || '',
      profession: dbUser.profession || '',
      plan_type: trialSub ? trialSub.planType : currentPlan,
      trial_started_at: trialSub ? (trialSub.trialStartedAt ? trialSub.trialStartedAt.toISOString() : null) : null,
      trial_expires_at: trialSub ? (trialSub.trialExpiresAt ? trialSub.trialExpiresAt.toISOString() : null) : null,
      trial_used: trialSub ? trialSub.trialUsed : false
    };

    return res.status(200).json(mergedProfile);

  } catch (error) {
    console.error('[Profile Controller getProfile Error]:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (user.is_coupon) {
      return res.status(403).json({ error: 'Profiles associated with special coupons cannot be modified.' });
    }

    const numericId = parseInt(user.id, 10);
    const { full_name, date_of_birth, gender, profession } = req.body;

    const dbUser = await prisma.user.update({
      where: { id: numericId },
      data: {
        fullName: full_name,
        dateOfBirth: date_of_birth,
        gender: gender,
        profession: profession
      },
      include: { subscription: true }
    });

    let currentPlan = dbUser.subscription ? dbUser.subscription.planType : 'Basic';
    const trialSub = await getOrInitializeTrial(dbUser.id, dbUser.email, currentPlan);

    return res.status(200).json({
      success: true,
      profile: {
        id: dbUser.id.toString(),
        email: dbUser.email,
        full_name: dbUser.fullName || '',
        date_of_birth: dbUser.dateOfBirth || '',
        gender: dbUser.gender || '',
        profession: dbUser.profession || '',
        plan_type: trialSub ? trialSub.planType : currentPlan,
        trial_started_at: trialSub ? (trialSub.trialStartedAt ? trialSub.trialStartedAt.toISOString() : null) : null,
        trial_expires_at: trialSub ? (trialSub.trialExpiresAt ? trialSub.trialExpiresAt.toISOString() : null) : null,
        trial_used: trialSub ? trialSub.trialUsed : false
      }
    });

  } catch (error) {
    console.error('[Profile Controller updateProfile Error]:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

async function sessionStatus(req, res) {
  try {
    if (req.user) {
      if (req.user.is_coupon) {
        return res.status(200).json({
          authenticated: true,
          user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${req.user.email}`,
            gender: 'Not Available',
            profession: 'Not Available',
            date_of_birth: 'Not Available',
            plan_type: 'Premium',
            is_coupon: true,
            token: req.cookies.aios_token
          }
        });
      }

      const numericId = parseInt(req.user.id, 10);
      const dbUser = await prisma.user.findUnique({
        where: { id: numericId },
        include: { subscription: true }
      });

      if (!dbUser) {
        return res.status(200).json({ authenticated: false });
      }

      let currentPlan = dbUser.subscription ? dbUser.subscription.planType : 'Basic';
      const trialSub = await getOrInitializeTrial(dbUser.id, dbUser.email, currentPlan);

      const userPayload = {
        id: dbUser.id.toString(),
        email: dbUser.email,
        name: dbUser.fullName || '',
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${dbUser.email}`,
        gender: dbUser.gender || '',
        profession: dbUser.profession || '',
        date_of_birth: dbUser.dateOfBirth || '',
        plan_type: trialSub ? trialSub.planType : currentPlan,
        trial_started_at: trialSub ? (trialSub.trialStartedAt ? trialSub.trialStartedAt.toISOString() : null) : null,
        trial_expires_at: trialSub ? (trialSub.trialExpiresAt ? trialSub.trialExpiresAt.toISOString() : null) : null,
        trial_used: trialSub ? trialSub.trialUsed : false,
        is_coupon: false,
        token: req.cookies.aios_token
      };

      return res.status(200).json({
        authenticated: true,
        user: userPayload
      });
    } else {
      return res.status(200).json({ authenticated: false });
    }
  } catch (error) {
    console.error('[Profile Controller sessionStatus Error]:', error.message);
    return res.status(200).json({ authenticated: false });
  }
}

module.exports = {
  getOrInitializeTrial,
  getProfile,
  updateProfile,
  sessionStatus
};
