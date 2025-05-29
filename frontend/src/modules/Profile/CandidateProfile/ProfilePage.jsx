import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Spin, message, Typography, Row, Col, Divider, List, Tag, Empty, Badge } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, LoadingOutlined, CalendarOutlined, ClockCircleOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, TrophyOutlined, CodeOutlined, HeartOutlined, GlobalOutlined, ToolOutlined } from '@ant-design/icons';
import { fetchCandidateProfile, updateCandidateProfile, uploadResume, addEducation, addSkill } from '../../../services/profileService';
import ResumeUpload from '../../../components/ResumeUpload/ResumeUpload';
import './ProfilePage.css';

const { Title, Text } = Typography;

// Function to get color based on proficiency level
const getProficiencyColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'beginner': return 'blue';
    case 'intermediate': return 'green';
    case 'expert': return 'gold';
    case 'advanced': return 'purple';
    default: return 'default';
  }
};

// Function to categorize skills
const categorizeSkills = (skills) => {
  const categories = {
    technical: [],
    soft: [],
    language: [],
    other: []
  };

  skills?.forEach(skill => {
    const category = skill.skill_category?.toLowerCase() || 'other';
    if (categories[category]) {
      categories[category].push(skill);
    } else {
      categories.other.push(skill);
    }
  });

  return categories;
};

// Function to get category icon and color
const getCategoryConfig = (category) => {
  const configs = {
    technical: {
      icon: <CodeOutlined />,
      color: '#389e0d',
      title: 'Technical Skills',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f'
    },
    soft: {
      icon: <HeartOutlined />,
      color: '#eb2f96',
      title: 'Soft Skills',
      bgColor: '#fff0f6',
      borderColor: '#ffadd6'
    },
    language: {
      icon: <GlobalOutlined />,
      color: '#722ed1',
      title: 'Languages',
      bgColor: '#f9f0ff',
      borderColor: '#d3adf7'
    },
    other: {
      icon: <ToolOutlined />,
      color: '#fa8c16',
      title: 'Other Skills',
      bgColor: '#fff7e6',
      borderColor: '#ffd591'
    }
  };
  return configs[category] || configs.other;
};

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch profile data function
  const getProfileData = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidateProfile();
      setProfile(data);
      
      // Set form values
      form.setFieldsValue({
        name: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        years_experience: data.years_experience || '',
      });
      
      // Add resume file to fileList if it exists
      if (data.resume_file_path) {
        setFileList([
          {
            uid: '-1',
            name: data.resume_file_path.split('/').pop(),
            status: 'done',
            url: data.resume_file_path,
          },
        ]);
      }
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
        name: profile?.fullName || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        years_experience: profile?.years_experience || '',
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateCandidateProfile({
        fullName: values.name,
        phone: values.phone,
        location: values.location,
        years_experience: values.years_experience,
      });
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        fullName: values.name,
        phone: values.phone,
        location: values.location,
        years_experience: values.years_experience,
      }));
      
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (fileOrBoolean, result) => {
    try {
      // If only boolean is passed, just set the uploading state
      if (typeof fileOrBoolean === 'boolean') {
        setUploading(fileOrBoolean);
        return;
      }
      
      // Otherwise, process the file upload result
      setUploading(true);
      
      setFileList([
        {
          uid: '-1',
          name: fileOrBoolean.name,
          status: 'done',
          url: result.file_path,
        },
      ]);
      
      // Update profile with new resume path
      setProfile(prev => ({
        ...prev,
        resume_file_path: result.file_path,
      }));
      
      message.success('Resume uploaded successfully! Profile data will be extracted and updated.');
      
      // Refresh the profile data after resume upload to get updated information
      await getProfileData();
    } catch (error) {
      message.error('Failed to process resume upload');
    } finally {
      setUploading(false);
    }
  };

  // Add a new education record
  const handleAddEducation = async (values) => {
    try {
      const result = await addEducation({
        degree: values.degree,
        institution: values.institution,
        graduation_year: values.graduation_year,
        gpa: values.gpa,
      });
      
      // Update local state with new education record
      setProfile(prev => ({
        ...prev,
        education: [...(prev.education || []), result.education],
      }));
      
      message.success('Education record added successfully');
      return true;
    } catch (error) {
      message.error('Failed to add education record');
      return false;
    }
  };

  // Add a new skill
  const handleAddSkill = async (values) => {
    try {
      const result = await addSkill({
        skill_name: values.skill_name,
        skill_category: values.skill_category,
        proficiency_level: values.proficiency_level,
      });
      
      // Update local state with new skill
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), result.skill],
      }));
      
      message.success('Skill added successfully');
      return true;
    } catch (error) {
      message.error('Failed to add skill');
      return false;
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'LOOKING':
        return 'blue';
      case 'HIRED':
        return 'gold';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <Text style={{ marginTop: 16 }}>Loading profile...</Text>
      </div>
    );
  }

  return (
    <div 
      className="profile-container fade-in-animation" 
      style={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Add full-page blur overlay when uploading */}
      {uploading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Spin 
            size="large" 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} 
          />
          <Text style={{ marginTop: 24, fontSize: '18px', fontWeight: 'bold' }}>
            Processing your resume...
          </Text>
          <Text type="secondary" style={{ marginTop: 8 }}>
            Extracting profile information
          </Text>
        </div>
      )}

      <Row justify="space-between" align="middle" className="profile-header">
        <Title level={2}>My Profile</Title>
        <Button 
          type={editing ? "primary" : "default"}
          icon={editing ? <SaveOutlined /> : <EditOutlined />}
          onClick={handleEditToggle}
          disabled={uploading}
        >
          {editing ? "Save Mode" : "Edit Mode"}
        </Button>
      </Row>
      
      <Card className="profile-card">
        {/* Top Section: Profile Info and Resume Upload */}
        <Row gutter={24} style={{ marginBottom: 32 }}>
          {/* Left Column: Profile Avatar Section */}
          <Col xs={24} md={12}>
            <div className="profile-avatar-section" style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Avatar size={80} icon={<UserOutlined />} src={profile?.avatar_url} />
              <Title level={5} style={{ marginTop: 12, marginBottom: 6 }}>{profile?.fullName || 'Your Name'}</Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>{profile?.email || 'email@example.com'}</Text>
              
              {/* Display profile status */}
              <div style={{ marginTop: 8 }}>
                <Badge 
                  color={getStatusColor(profile?.status)} 
                  text={profile?.status || 'Status not set'} 
                  style={{ fontSize: '12px' }}
                />
              </div>
              
              {/* Display account dates */}
              <div style={{ marginTop: 16, fontSize: '11px' }}>
                <div style={{ marginBottom: 6 }}>
                  <CalendarOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                  <Text type="secondary">Member since: {formatDate(profile?.created_at)}</Text>
                </div>
                <div>
                  <ClockCircleOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                  <Text type="secondary">Last updated: {formatDate(profile?.updated_at)}</Text>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Column: Resume Upload Section */}
          <Col xs={24} md={12}>
            <ResumeUpload
              onUpload={handleResumeUpload}
              fileList={fileList}
              uploading={uploading}
              handleResumeUpload={handleResumeUpload}
              onRemove={() => setFileList([])}
            />
          </Col>
        </Row>
        
        {/* Profile Form Section */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-header">
            <Title level={4}>Personal Information</Title>
          </div>
          
          {!editing ? (
            /* Read-only view with improved styling */
            <div className="personal-info-section">
              <div className="personal-info-grid">
                <div className="personal-info-item">
                  <div className="personal-info-label">
                    <UserOutlined />
                    Full Name
                  </div>
                  <div className={`personal-info-value ${!profile?.fullName ? 'empty' : ''}`}>
                    {profile?.fullName || 'Not provided'}
                  </div>
                </div>

                <div className="personal-info-item">
                  <div className="personal-info-label">
                    <MailOutlined />
                    Email Address
                  </div>
                  <div className={`personal-info-value ${!profile?.email ? 'empty' : ''}`}>
                    {profile?.email || 'Not provided'}
                  </div>
                </div>

                <div className="personal-info-item">
                  <div className="personal-info-label">
                    <PhoneOutlined />
                    Phone Number
                  </div>
                  <div className={`personal-info-value ${!profile?.phone ? 'empty' : ''}`}>
                    {profile?.phone || 'Not provided'}
                  </div>
                </div>

                <div className="personal-info-item">
                  <div className="personal-info-label">
                    <EnvironmentOutlined />
                    Location
                  </div>
                  <div className={`personal-info-value ${!profile?.location ? 'empty' : ''}`}>
                    {profile?.location || 'Not provided'}
                  </div>
                </div>

                <div className="personal-info-item">
                  <div className="personal-info-label">
                    <TrophyOutlined />
                    Years of Experience
                  </div>
                  <div className={`personal-info-value ${!profile?.years_experience ? 'empty' : ''}`}>
                    {profile?.years_experience ? `${profile.years_experience} years` : 'Not specified'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit mode with improved form styling */
            <div className="personal-info-edit-form">
              <Form 
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="profile-form"
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} lg={12}>
                    <Form.Item 
                      label={
                        <span style={{ fontWeight: 600, color: '#262626' }}>
                          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          Full Name
                        </span>
                      } 
                      name="name" 
                      rules={[{ required: true, message: 'Name is required' }]}
                    >
                      <Input 
                        placeholder="Enter your full name" 
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Form.Item 
                      label={
                        <span style={{ fontWeight: 600, color: '#262626' }}>
                          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          Email Address
                        </span>
                      } 
                      name="email"
                    >
                      <Input 
                        placeholder="Email address" 
                        disabled 
                        size="large"
                        style={{ borderRadius: '8px', backgroundColor: '#f5f5f5' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={[24, 16]}>
                  <Col xs={24} lg={12}>
                    <Form.Item 
                      label={
                        <span style={{ fontWeight: 600, color: '#262626' }}>
                          <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          Phone Number
                        </span>
                      } 
                      name="phone"
                    >
                      <Input 
                        placeholder="Enter your phone number" 
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Form.Item 
                      label={
                        <span style={{ fontWeight: 600, color: '#262626' }}>
                          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          Location
                        </span>
                      } 
                      name="location"
                    >
                      <Input 
                        placeholder="Your location (city, country)" 
                        size="large"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row>
                  <Col xs={24} lg={12}>
                    <Form.Item 
                      label={
                        <span style={{ fontWeight: 600, color: '#262626' }}>
                          <TrophyOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          Years of Experience
                        </span>
                      } 
                      name="years_experience"
                    >
                      <Input 
                        type="number" 
                        placeholder="Years of professional experience" 
                        size="large" 
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <div className="personal-info-form-actions">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={saving}
                    size="large"
                    icon={<SaveOutlined />}
                    style={{ borderRadius: '8px', minWidth: '140px' }}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    onClick={() => setEditing(false)} 
                    size="large"
                    style={{ borderRadius: '8px', minWidth: '100px' }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </div>
        
        <Divider />
        
        {/* Education Section */}
        <div className="profile-section">
          <div className="section-header">
            <Title level={4}>Education</Title>
          </div>
          
          {profile?.education && profile.education.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={profile.education}
              renderItem={item => (
                <Card className="education-card" size="small">
                  {/* <Row> */}
                    <Col span={25} style={{ textAlign: 'center' }}>
                      <Text strong>{item.degree}</Text>
                      <br />
                      <Text>{item.institution}</Text>
                      <br />
                      <Text type="secondary">
                        Graduation Year: {item.graduation_year}
                        {item.gpa && ` • GPA: ${item.gpa}`}
                      </Text>
                    </Col>
                  {/* </Row> */}
                </Card>
              )}
            />
          ) : (
            <div className="empty-state">
              <Empty description="No education records added yet" />
            </div>
          )}
        </div>
        
        {/* Skills Section */}
        <div className="profile-section">
          <div className="section-header">
            <Title level={4}>Skills</Title>
          </div>
          
          {profile?.skills && profile.skills.length > 0 ? (
            <div className="skills-categories-container">
              <Row gutter={[16, 16]}>
                {Object.entries(categorizeSkills(profile.skills)).map(([category, skills]) => {
                  const config = getCategoryConfig(category);
                  return (
                    <Col xs={24} sm={12} lg={6} key={category}>
                      <Card
                        className="skills-category-card"
                        size="small"
                        style={{
                          backgroundColor: config.bgColor,
                          borderColor: config.borderColor,
                          borderWidth: 2,
                          height: '100%',
                          minHeight: '200px'
                        }}
                        title={
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: config.color,
                            fontSize: '14px',
                            fontWeight: 600
                          }}>
                            <span style={{ marginRight: 8,  fontSize: '16px' }}>
                              {config.icon}
                            </span>
                            {config.title}
                            <Badge 
                              count={skills.length} 
                              style={{ 
                                backgroundColor: config.color,
                                marginLeft: '4px'
                              }} 
                            />
                          </div>
                        }
                      >
                        <div className="skills-list">
                          {skills.length > 0 ? (
                            skills.map(skill => (
                              <Tag 
                                color={getProficiencyColor(skill.proficiency_level)} 
                                key={skill.skill_id} 
                                style={{ 
                                  margin: '0 4px 8px 0', 
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  borderRadius: '6px'
                                }}
                              >
                                {skill.skill_name}
                                {skill.proficiency_level && (
                                  <Text 
                                    style={{ 
                                      fontSize: '10px', 
                                      opacity: 0.8,
                                      marginLeft: 4
                                    }}
                                  >
                                    ({skill.proficiency_level.toLowerCase()})
                                  </Text>
                                )}
                              </Tag>
                            ))
                          ) : (
                            <div className="skills-empty-state">
                              <Text 
                                type="secondary" 
                                style={{ 
                                  fontSize: '12px',
                                  fontStyle: 'italic'
                                }}
                              >
                                No {config.title.toLowerCase()} added yet
                              </Text>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ) : (
            <div className="empty-state">
              <Empty 
                description="No skills added yet" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>

      </Card>
    </div>
  );
};

export default ProfilePage;