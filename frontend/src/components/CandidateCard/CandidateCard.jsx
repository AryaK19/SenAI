import { Card, Avatar, Typography, Tag, Button, Space, Tooltip, Badge, Divider, List } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  StarFilled,
  ToolOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import { updateCandidateShortlistStatus, getResumeDownloadUrl } from '../../services/companyService';
import './CandidateCard.css';

const { Title, Text, Paragraph } = Typography;

const CandidateCard = ({ candidate, onStatusChange }) => {
  const [shortlisted, setShortlisted] = useState(candidate.shortlisted);
  const [loading, setLoading] = useState(false);

  // Function to handle shortlisting/un-shortlisting candidates
  const handleShortlistToggle = async () => {
    try {
      setLoading(true);
      const newStatus = !shortlisted;
      const result = await updateCandidateShortlistStatus(candidate.id, newStatus);
      setShortlisted(result.shortlisted);
      if (onStatusChange) {
        onStatusChange(candidate.id, result.shortlisted);
      }
    } catch (error) {
      console.error("Failed to update shortlist status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get resume download URL
  const resumeUrl = getResumeDownloadUrl(candidate.resume_path);

  // Group skills by category
  const skillsByCategory = candidate.skills?.reduce((acc, skill) => {
    const category = skill.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  // Get skill category color
  const getSkillCategoryColor = (category) => {
    switch (category) {
      case 'technical':
        return 'blue';
      case 'soft':
        return 'green';
      case 'language':
        return 'purple';
      default:
        return 'default';
    }
  };

  // Get proficiency color
  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner':
        return '#87d068';
      case 'intermediate':
        return '#108ee9';
      case 'advanced':
        return '#722ed1';
      case 'expert':
        return '#f50';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <Card 
      className={`candidate-card ${shortlisted ? 'shortlisted' : ''}`}
      hoverable
      style={{
        borderColor: shortlisted ? '#52c41a' : '#d9d9d9',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div className="candidate-header">
        <div className="candidate-avatar-container">
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            className={shortlisted ? 'shortlisted-avatar' : ''}
          />
          {shortlisted && (
            <Badge 
              count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
              className="shortlist-badge"
            />
          )}
        </div>
        <div className="candidate-title">
          <Title level={4}>{candidate.fullname}</Title>
          <div className="candidate-meta">
            <Badge status={shortlisted ? "success" : "processing"} 
              text={shortlisted ? "Shortlisted" : "Under review"} 
              style={{ marginRight: '12px' }} 
            />
            <Text type="secondary">Applied: {formatDate(candidate.applied_date)}</Text>
          </div>
        </div>
        <div className="candidate-actions">
          <Button 
            type={shortlisted ? "default" : "primary"}
            icon={shortlisted ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={handleShortlistToggle}
            loading={loading}
          >
            {shortlisted ? "Remove" : "Shortlist"}
          </Button>
        </div>
      </div>

      <Divider />

      <div className="candidate-body">
        <div className="candidate-info">
          <div className="info-item">
            <MailOutlined className="info-icon" />
            <Text copyable>{candidate.email}</Text>
          </div>
          
          {candidate.phone && (
            <div className="info-item">
              <PhoneOutlined className="info-icon" />
              <Text copyable>{candidate.phone}</Text>
            </div>
          )}
          
          {candidate.location && (
            <div className="info-item">
              <EnvironmentOutlined className="info-icon" />
              <Text>{candidate.location}</Text>
            </div>
          )}
          
          {candidate.years_experience && (
            <div className="info-item">
              <CalendarOutlined className="info-icon" />
              <Text>{candidate.years_experience} {candidate.years_experience === 1 ? 'year' : 'years'} experience</Text>
            </div>
          )}
          
          {resumeUrl && (
            <div className="info-item">
              <FileTextOutlined className="info-icon" />
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                Download Resume
              </a>
            </div>
          )}
        </div>

        {candidate.education && candidate.education.length > 0 && (
          <div className="candidate-section">
            <Title level={5}>
              <BookOutlined /> Education
            </Title>
            <List
              size="small"
              dataSource={candidate.education}
              renderItem={item => (
                <List.Item>
                  <div className="education-item">
                    <div>
                      <Text strong>{item.degree}</Text>
                      <br />
                      <Text>{item.institution}</Text>
                    </div>
                    <div>
                      <Text type="secondary">{item.graduation_year}</Text>
                      {item.gpa && <Text type="secondary"> • GPA: {item.gpa}</Text>}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="candidate-section">
            <Title level={5}>
              <ToolOutlined /> Skills
            </Title>
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category} className="skill-category">
                <Text strong style={{ marginRight: '8px', textTransform: 'capitalize' }}>
                  {category}:
                </Text>
                <div className="skills-container">
                  {skills.map((skill, index) => (
                    <Tooltip 
                      key={index} 
                      title={skill.proficiency ? `${skill.proficiency} level` : ''}
                      placement="top"
                    >
                      <Tag 
                        color={getSkillCategoryColor(category)}
                        className="skill-tag"
                        style={{ borderLeft: `3px solid ${getProficiencyColor(skill.proficiency)}` }}
                      >
                        {skill.skill_name}
                      </Tag>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CandidateCard;
