export const RIGHTS = {
  RESET_PASSWORD: 'reset_password',
  EDIT_RIDER: 'edit_rider',
  DELETE_RIDER: 'delete_rider',
  ADD_RIDER: 'add_rider',
  MANAGE_USER: 'manage_users',
  MANAGE_BOBODASMART: 'manage_bobodasmart',
  MANAGE_WEBSITE: 'manage_website',
  MANAGE_LEADERSHIP: 'manage_leadership',
  MANAGE_DENTAL: 'manage_dental',
} as const;

export const ADMIN_RIGHTS_INFO = {
  RESET_PASSWORD: {
    value: 'reset_password',
    description: 'Allows resetting passwords for other users in the system'
  },
  EDIT_RIDER: {
    value: 'edit_rider',
    description: 'Permits editing rider information and profile details'
  },
  DELETE_RIDER: {
    value: 'delete_rider',
    description: 'Enables the removal of rider accounts from the system'
  },
  ADD_RIDER: {
    value: 'add_rider',
    description: 'Allows creating new rider accounts in the system'
  },
  MANAGE_USER: {
    value: 'manage_user',
    description: 'Full access to user management including rights assignment'
  },
  MANAGE_BOBODASMART: {
    value: 'manage_bobodasmart',
    description: 'Full access to manage BobodaSmart system including riders and analytics'
  },
  MANAGE_WEBSITE: {
    value: 'manage_website',
    description: 'Full access to manage website content and messages'
  },
  MANAGE_LEADERSHIP: {
    value: 'manage_leadership',
    description: 'Full access to manage Leadership Management system'
  },
  MANAGE_DENTAL: {
    value: 'manage_dental',
    description: 'Full access to manage Dental Health Program including patient records and appointments'
  }
};

export const checkUserRights = (requiredRight: string): boolean => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;

    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const userRights = tokenData.rights || [];
    
    console.log('Checking rights:', {
      userRights,
      requiredRight,
      hasRight: userRights.includes(requiredRight)
    });

    return userRights.includes(requiredRight);
  } catch (error) {
    console.error('Error checking rights:', error);
    return false;
  }
}; 