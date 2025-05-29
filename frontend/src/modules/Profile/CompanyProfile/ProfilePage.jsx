import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Spin, message, Typography, Row, Col, Divider, Select, DatePicker, Badge,Tag } from 'antd';
import { EditOutlined, SaveOutlined, LoadingOutlined, EnvironmentOutlined, DollarOutlined, BookOutlined, ClockCircleOutlined, CalendarOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { fetchCompanyProfile, updateCompanyProfile } from '../../../services/profileService';
import moment from 'moment';
import './ProfilePage.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Fetch profile data function
  const getProfileData = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanyProfile();
      setProfile(data);
      
      // Set form values
      form.setFieldsValue({
        companyName: data.companyName || '',
        job_role: data.job_role || '',
        job_type: data.job_type || '',
        stipend: data.stipend || '',
        location: data.location || '',
        skills_required: data.skills_required || '',
        education_qualification: data.education_qualification || '',
        description: data.description || '',
        application_deadline: data.application_deadline ? moment(data.application_deadline) : null,
      });
    } catch (error) {
      message.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data when component mounts
  useEffect(() => {
    getProfileData();
  }, [form]);

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      form.setFieldsValue({
        companyName: profile?.companyName || '',
        job_role: profile?.job_role || '',
        job_type: profile?.job_type || '',
        stipend: profile?.stipend || '',
        location: profile?.location || '',
        skills_required: profile?.skills_required || '',
        education_qualification: profile?.education_qualification || '',
        description: profile?.description || '',
        application_deadline: profile?.application_deadline ? moment(profile.application_deadline) : null,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const updatedData = {
        companyName: values.companyName,
        job_role: values.job_role,
        job_type: values.job_type,
        stipend: values.stipend,
        location: values.location,
        skills_required: values.skills_required,
        education_qualification: values.education_qualification,
        description: values.description,
        application_deadline: values.application_deadline ? values.application_deadline.format('YYYY-MM-DD') : null,
      };
      
      const result = await updateCompanyProfile(updatedData);
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        ...result.company,
        profile_completed: true
      }));
      
      message.success('Job profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update job profile');
    } finally {
      setSaving(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <Text style={{ marginTop: 16 }}>Loading profile...</Text>
      </div>
    );
  }

  // Split skills string into array for display
  const skillsArray = profile?.skills_required?.split(',').filter(Boolean).map(skill => skill.trim()) || [];

  // Profile completion status
  const isProfileComplete = profile?.profile_completed || false;

  return (
    <div className="company-profile-container fade-in-animation">
      <Row justify="space-between" align="left" className="profile-header">
        <div>
          <Title level={2}>Job Profile</Title>

          {isProfileComplete && (
            <Badge 
              status="success" 
              text={
                <Text type="success" style={{ fontSize: '14px' }}>
                  <CheckCircleOutlined style={{ marginRight: 8 }} />
                  Job profile complete
                </Text>
              }
            />
          )}
        </div>
        <Button 
          type={editing ? "primary" : "default"}
          icon={editing ? <SaveOutlined /> : <EditOutlined />}
          onClick={handleEditToggle}
        >
          {editing ? "Save Mode" : "Edit Mode"}
        </Button>
      </Row>
      
      <Card className="company-profile-card">
        {!editing ? (
          /* Read-only view */
          <div className="company-profile-view">
            <div className="company-header">
              <Title level={3}>{profile?.companyName || 'Company Name'}</Title>
              <Badge 
                color={isProfileComplete ? 'green' : 'orange'} 
                text={isProfileComplete ? 'Active' : 'Incomplete'} 
              />
            </div>
            
            <Divider />
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card className="job-details-card" title="Job Details" bordered={false}>
                  <div className="detail-item">
                    <Text strong>Job Role:</Text>
                    <Text>{profile?.job_role || 'Not specified'}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Job Type:</Text>
                    <Text>{profile?.job_type || 'Not specified'}</Text>
                  </div>
                  <div className="detail-item">
                    <DollarOutlined className="detail-icon" />
                    <Text strong>Stipend:</Text>
                    <Text>{profile?.stipend || 'Not specified'}</Text>
                  </div>
                  <div className="detail-item">
                    <EnvironmentOutlined className="detail-icon" />
                    <Text strong>Location:</Text>
                    <Text>{profile?.location || 'Not specified'}</Text>
                  </div>
                  <div className="detail-item">
                    <CalendarOutlined className="detail-icon" />
                    <Text strong>Posted Date:</Text>
                    <Text>{formatDate(profile?.posted_date)}</Text>
                  </div>
                  <div className="detail-item">
                    <ClockCircleOutlined className="detail-icon" />
                    <Text strong>Application Deadline:</Text>
                    <Text>{formatDate(profile?.application_deadline)}</Text>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card className="requirements-card" title="Requirements" bordered={false}>
                  <div className="detail-item">
                    <BookOutlined className="detail-icon" />
                    <Text strong>Education Qualifications:</Text>
                  </div>
                  <Paragraph className="qualification-text">
                    {profile?.education_qualification || 'No specific qualifications mentioned'}
                  </Paragraph>
                  
                  <div className="detail-item" style={{ marginTop: 16 }}>
                    <Text strong>Required Skills:</Text>
                  </div>
                  <div className="skills-container">
                    {skillsArray.length > 0 ? (
                      skillsArray.map((skill, index) => (
                        <Tag key={index} color="blue" className="skill-tag">{skill}</Tag>
                      ))
                    ) : (
                      <Text type="secondary">No specific skills mentioned</Text>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Card className="description-card" title="Job Description" bordered={false} style={{ marginTop: 24 }}>
              <Paragraph>
                {profile?.description || 'No job description provided.'}
              </Paragraph>
            </Card>
          </div>
        ) : (
          /* Edit mode with form */
          <Form 
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="company-profile-form"
          >
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item 
                  label="Company Name" 
                  name="companyName" 
                  rules={[{ required: true, message: 'Company name is required' }]}
                >
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Job Role" 
                  name="job_role"
                  rules={[{ required: true, message: 'Job role is required' }]}
                >
                  <Input placeholder="e.g. Software Engineer, Product Manager" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Job Type" 
                  name="job_type"
                  rules={[{ required: true, message: 'Job type is required' }]}
                >
                  <Select placeholder="Select job type">
                    <Option value="Full-time">Full-time</Option>
                    <Option value="Part-time">Part-time</Option>
                    <Option value="Contract">Contract</Option>
                    <Option value="Internship">Internship</Option>
                    <Option value="Remote">Remote</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Stipend/Salary" 
                  name="stipend"
                  rules={[{ required: true, message: 'Stipend/Salary is required' }]}
                >
                  <Input placeholder="e.g. $5000/month, $60-80K/year" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Location" 
                  name="location"
                  rules={[{ required: true, message: 'Location is required' }]}
                >
                  <Input placeholder="e.g. New York, NY or Remote" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Application Deadline" 
                  name="application_deadline"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item 
                  label="Required Skills (comma separated)" 
                  name="skills_required"
                  rules={[{ required: true, message: 'At least one skill is required' }]}
                >
                  <Input placeholder="e.g. React, Node.js, Python, AWS" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item 
                  label="Education Qualifications" 
                  name="education_qualification"
                >
                  <TextArea 
                    placeholder="Describe required education qualifications" 
                    autoSize={{ minRows: 2, maxRows: 4 }} 
                  />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item 
                  label="Job Description" 
                  name="description"
                  rules={[{ required: true, message: 'Job description is required' }]}
                >
                  <TextArea 
                    placeholder="Provide a detailed job description" 
                    autoSize={{ minRows: 4, maxRows: 8 }} 
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <div className="form-actions">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
                icon={<SaveOutlined />}
              >
                Save Job Profile
              </Button>
              <Button 
                onClick={() => setEditing(false)} 
                style={{ marginLeft: 8 }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
