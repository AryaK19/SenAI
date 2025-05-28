import { Layout, Menu, Dropdown, Avatar, Space, Typography, Image } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, ProfileOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../../services/authService';

const { Header } = Layout;
const { Text } = Typography;

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    // Force a page reload to ensure clean state
    window.location.href = '/login';
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: handleLogout
    }
  ];

  const navItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Header 
      style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'white',
        height: '64px',
        lineHeight: '64px',
        boxShadow: '0 2px 6px rgba(0, 3, 170, 0.05)',
        borderBottom: '1px solid #f0f0f0'
      }}
    >
      {/* Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        minWidth: '70px',
      }}>
        <Image 
          src="/src/assets/logo.png" 
          alt="Logo" 
          width={60} 
          height={60}
          preview={false}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="light"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={navItems}
        onClick={handleMenuClick}
        style={{ 
          flex: 1, 
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          height: '64px',
          lineHeight: '64px',
        }}
        className="professional-nav-menu"
      />

      {/* User Menu */}
      <div style={{ minWidth: '140px', textAlign: 'right' }}>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Space style={{ cursor: 'pointer', color: '#333' }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            />
            <Text style={{ color: '#333', fontWeight: 500 }}>
              {currentUser?.name || currentUser?.company_name || 'User'}
            </Text>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default NavBar;
