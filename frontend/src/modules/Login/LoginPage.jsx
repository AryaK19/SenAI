import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Typography, 
  Divider, 
  Space,
  Row,
  Col,
  Image,
  message,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  BuildOutlined, 
  IdcardOutlined
} from '@ant-design/icons';
import { registerCompany, registerCandidate, loginCompany, loginCandidate } from '../../services/authService';
import './LoginPage.css';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('candidate-login');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyForm] = Form.useForm();
  const [candidateForm] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      if (isRegister) {
        // Handle registration
        if (activeTab === 'company-login') {
          await registerCompany({
            email: values.email,
            companyName: values.companyName,
            password: values.password
          });
          message.success('Company registered successfully! You can now log in.');
          companyForm.resetFields();
          setIsRegister(false);
        } else {
          await registerCandidate({
            email: values.email,
            fullName: values.fullName,
            phone: values.phone || '',
            password: values.password
          });
          message.success('Candidate registered successfully! You can now log in.');
          candidateForm.resetFields();
          setIsRegister(false);
        }
      } else {
        // Handle login
        if (activeTab === 'company-login') {
          const response = await loginCompany({
            email: values.email,
            password: values.password
          });
          message.success(`Welcome back, ${response.company.companyName}!`);
          // Reload the page to update authentication state
          window.location.href = '/';
        } else {
          const response = await loginCandidate({
            email: values.email,
            password: values.password
          });
          message.success(`Welcome back, ${response.candidate.fullName}!`);
          // Reload the page to update authentication state
          window.location.href = '/';
        }
      }
    } catch (error) {
      const errorMessage = error.message || `${isRegister ? 'Registration' : 'Login'} failed. Please try again.`;
      setError(errorMessage);
      console.error(`${isRegister ? 'Registration' : 'Login'} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRegister = () => {
    setIsRegister(!isRegister);
    setError(''); // Clear error when switching modes
    companyForm.resetFields();
    candidateForm.resetFields();
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setError(''); // Clear error when switching tabs
    companyForm.resetFields();
    candidateForm.resetFields();
  };

  const items = [
    {
      key: 'candidate-login',
      label: <span><IdcardOutlined /> Candidate</span>,
      children: (
        <div>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setError('')}
            />
          )}
          <Form
            form={candidateForm}
            name="candidate-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            
            {isRegister && (
              <>
                <Form.Item
                  name="fullName"
                  rules={[{ required: true, message: 'Please enter your full name!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Full Name" />
                </Form.Item>
                
                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: 'Please enter your phone number!' }]}
                >
                  <Input placeholder="Phone Number" />
                </Form.Item>
              </>
            )}

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            {isRegister && (
              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
              </Form.Item>
            )}

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <a className="login-form-forgot" href="#">
                Forgot password
              </a>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
                {isRegister ? 'Register' : 'Login'}
              </Button>
            </Form.Item>
            
            <Divider plain>OR</Divider>
            
            <Text>
              {isRegister ? 'Already have an account?' : 'New to our platform?'}{' '}
              <a onClick={toggleRegister}>
                {isRegister ? 'Login' : 'Register now!'}
              </a>
            </Text>
          </Form>
        </div>
      ),
    },
    {
      key: 'company-login',
      label: <span><BuildOutlined /> Company</span>,
      children: (
        <div>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setError('')}
            />
          )}
          <Form
            form={companyForm}
            name="company-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            
            {isRegister && (
              <Form.Item
                name="companyName"
                rules={[{ required: true, message: 'Please enter company name!' }]}
              >
                <Input prefix={<BuildOutlined />} placeholder="Company Name" />
              </Form.Item>
            )}

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            {isRegister && (

              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
              </Form.Item>
            )}

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <a className="login-form-forgot" href="#">
                Forgot password
              </a>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
                {isRegister ? 'Register' : 'Login'}
              </Button>
            </Form.Item>
            
            <Divider plain>OR</Divider>
            
            <Text>
              {isRegister ? 'Already have an account?' : 'New to our platform?'}{' '}
              <a onClick={toggleRegister}>
                {isRegister ? 'Login' : 'Register now!'}
              </a>
            </Text>
          </Form>
        </div>
      )
    }
  ];

  return (
    <div className="login-page-container">
      <Row className="login-row" align="middle" justify="center">
        <Col xs={24} sm={24} md={12} lg={12} xl={12} className="login-left-panel">
          <div className="illustration-container">
            <img 
              src="/src/assets/flags/resume-illustration.jpg" 
              alt="Resume Analysis Illustration"
              className="login-illustration"
            />
            <h2>Find the perfect candidates with AI-driven precision</h2>
            <p>Our intelligent resume processing system streamlines your recruitment workflow</p>
          </div>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12} className="login-right-panel">
          <Card className="login-card">
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
              <div className="card-logo">
                <Image 
                  src="/src/assets/logo.png" 
                  alt="SenAI Logo" 
                  width={50} 
                  preview={false}
                />
              </div>
              <Title level={2}>Welcome to SenAI</Title>
              <Tabs 
                activeKey={activeTab} 
                items={items}
                onChange={handleTabChange}
                centered
                size="large"
                className="login-tabs"
              />
              <Paragraph className="terms-text">
                By clicking Continue to register or sign in, you agree to SenAI's 
                <a href="#"> User Agreement</a>, 
                <a href="#"> Privacy Policy</a>, and 
                <a href="#"> Cookie Policy</a>.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;