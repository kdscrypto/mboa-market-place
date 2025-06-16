
import React from 'react';
import UserInfoCard from './UserInfoCard';
import RoleChangeHistory from './RoleChangeHistory';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
  total_count: number;
}

interface UserDetailsSectionProps {
  user: UserData;
}

const UserDetailsSection: React.FC<UserDetailsSectionProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <UserInfoCard user={user} />
      <RoleChangeHistory user={user} />
    </div>
  );
};

export default UserDetailsSection;
