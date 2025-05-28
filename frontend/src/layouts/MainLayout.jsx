import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';

const { Content, Footer } = Layout;

const MainLayout = () => {
  return (
    <Layout 
      style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <NavBar />
      
      <Content 
        style={{ 
          flex: 1,
          padding: '24px 50px',
          overflow: 'auto',
          backgroundColor: 'white'
        }}
      >
        <div style={{ 
          minHeight: '100%',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px'
        }}>
          <Outlet />
        </div>
      </Content>
      
      <Footer 
        style={{ 
          textAlign: 'center',
          padding: '12px 50px',
          backgroundColor: '#001529',
          color: 'white',
          marginTop: 'auto'
        }}
      >
        Resume Processing System ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;