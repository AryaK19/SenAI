import { Card, Form, Input, Button, Upload, Avatar } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

const ProfilePage = () => {
  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={100} icon={<UserOutlined />} />
          <h2 style={{ marginTop: 16 }}>User Profile</h2>
        </div>
        
        <Form layout="vertical">
          <Form.Item label="Name" name="name">
            <Input placeholder="Full Name" />
          </Form.Item>
          
          <Form.Item label="Email" name="email">
            <Input placeholder="Email" />
          </Form.Item>
          
          <Form.Item label="Upload Resume" name="resume">
            <Upload>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary">Save Changes</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;