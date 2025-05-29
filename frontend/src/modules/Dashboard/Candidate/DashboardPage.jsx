import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tag,
  Button,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  Input,
  Select,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  RocketOutlined,
  FilterOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import "./CandidateDashboard.css";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Mock data for companies with job listings
const companyJobListings = [
  {
    id: 1,
    companyName: "GOOGLE Inc.",
    logo: "https://www.gstatic.com/marketing-cms/assets/images/82/9c/5e08f4b14c35b84be1821d200793/about-10things-google.png=s128-fcrop64=1,00000000ffffffff-rw",
    jobRole: "Senior Frontend Developer",
    jobType: "Remote",
    stipend: "$110,000 - $130,000",
    location: "San Francisco, CA (Remote)",
    skills: ["React", "TypeScript", "Redux", "SCSS", "Jest"],
    education: "Bachelor's in Computer Science or equivalent",
    description:
      "Join our dynamic team to build next-generation web applications using cutting-edge technologies.",
    postedDate: "2 days ago",
    applicationDeadline: "June 30, 2023",
    color: "#e6f7ff",
    borderColor: "#91d5ff",
    textColor: "#1890ff",
  },
  {
    id: 2,
    companyName: "Mirosoft Corporation",
    logo: "https://mailmeteor.com/logos/assets/PNG/Microsoft_Logo_512px.png",
    jobRole: "Data Scientist",
    jobType: "Hybrid",
    stipend: "$95,000 - $115,000",
    location: "New York, NY",
    skills: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "SQL",
      "Data Visualization",
    ],
    education: "Master's degree in Statistics, Data Science or related field",
    description:
      "Looking for an experienced data scientist to develop predictive models and extract insights from large datasets.",
    postedDate: "1 week ago",
    applicationDeadline: "July 15, 2023",
    color: "#e6f7ff",
    borderColor: "#91d5ff",
    textColor: "#1890ff",
  },
  {
    id: 3,
    companyName: "NVIDIA Corporation",
    logo: "https://s3.amazonaws.com/cms.ipressroom.com/219/files/20237/64e3dc1a3d6332319b2dfd35_NVIDIA-logo-white-16x9/NVIDIA-logo-white-16x9_927581a6-fc31-4fa5-85c6-379680c6aa6c-prv.png",
    jobRole: "DevOps Engineer",
    jobType: "Onsite",
    stipend: "$120,000 - $140,000",
    location: "Austin, TX",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    education:
      "Bachelor's in Computer Science, Engineering or equivalent experience",
    description:
      "Build and maintain our cloud infrastructure while optimizing deployment pipelines and ensuring system reliability.",
    postedDate: "3 days ago",
    applicationDeadline: "July 5, 2023",
    color: "#e6f7ff",
    borderColor: "#91d5ff",
    textColor: "#1890ff",
  },
  {
    id: 4,
    companyName: "ANT Group",
    logo: "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg",
    jobRole: "UX/UI Designer",
    jobType: "Remote",
    stipend: "$85,000 - $105,000",
    location: "Chicago, IL (Remote)",
    skills: [
      "Figma",
      "Adobe XD",
      "User Research",
      "Wireframing",
      "Prototyping",
    ],
    education: "Bachelor's in Design, HCI or related field",
    description:
      "Create beautiful, intuitive interfaces that delight users and solve complex design challenges.",
    postedDate: "5 days ago",
    applicationDeadline: "July 10, 2023",
    color: "#e6f7ff",
    borderColor: "#91d5ff",
    textColor: "#1890ff",
  },
  {
    id: 5,
    companyName: "GreenTree Innovations",
    logo: "https://www.greentreeinnovations.co.uk/wp-content/uploads/2023/11/cropped-GTI-Logo-Better-Qual-1.png",
    jobRole: "Blockchain Developer",
    jobType: "Hybrid",
    stipend: "$130,000 - $150,000",
    location: "Miami, FL",
    skills: ["Solidity", "Ethereum", "Smart Contracts", "Web3.js", "DApps"],
    education: "Bachelor's in Computer Science or equivalent",
    description:
      "Develop and implement blockchain solutions for our fintech products, focusing on security and scalability.",
    postedDate: "1 day ago",
    applicationDeadline: "June 25, 2023",
    color: "#e6f7ff",
    borderColor: "#91d5ff",
    textColor: "#1890ff",
  },
  {
    id: 6,
    companyName: "NexGen AI",
    logo: "https://nexgenai.solutions/wp-content/uploads/2021/08/next-logo-new.png",
    jobRole: "Machine Learning Engineer",
    jobType: "Onsite",
    stipend: "$125,000 - $145,000",
    location: "Seattle, WA",
    skills: ["PyTorch", "NLP", "Computer Vision", "Python", "MLOps"],
    education: "PhD or Master's in Computer Science, AI or related field",
    description:
      "Research and implement state-of-the-art machine learning models to solve complex business problems.",
    postedDate: "4 days ago",
    applicationDeadline: "July 20, 2023",
    color: "#e6f7ff",
    borderColor: "#91d5ff",
    textColor: "#1890ff",
  },
];

// Function to get the badge color for job type
const getJobTypeBadgeColor = (type) => {
  switch (type.toLowerCase()) {
    case "remote":
      return "green";
    case "hybrid":
      return "blue";
    case "onsite":
      return "orange";
    default:
      return "default";
  }
};

const CandidateDashboardPage = () => {
  const [filteredJobs, setFilteredJobs] = useState(companyJobListings);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterJobs(value, jobTypeFilter);
  };

  const handleJobTypeChange = (value) => {
    setJobTypeFilter(value);
    filterJobs(searchTerm, value);
  };

  const filterJobs = (search, jobType) => {
    let filtered = [...companyJobListings];

    if (search) {
      filtered = filtered.filter(
        (job) =>
          job.companyName.toLowerCase().includes(search.toLowerCase()) ||
          job.jobRole.toLowerCase().includes(search.toLowerCase()) ||
          job.skills.some((skill) =>
            skill.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    if (jobType && jobType !== "all") {
      filtered = filtered.filter(
        (job) => job.jobType.toLowerCase() === jobType.toLowerCase()
      );
    }

    setFilteredJobs(filtered);
  };

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]} className="dashboard-header">
        <Col span={24}>
          <Title level={2}>Candidate Dashboard</Title>
          <Text type="secondary">
            Find and apply for the best opportunities
          </Text>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={16} className="stats-cards">
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Applications Sent"
              value={12}
              prefix={<RocketOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Interviews Scheduled"
              value={3}
              prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Profile Views"
              value={45}
              prefix={<StarOutlined style={{ color: "#fa8c16" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Job Search Section */}
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Title level={4}>Available Opportunities</Title>
        </Col>
        <Col xs={24} lg={16}>
          <Search
            placeholder="Search by company, role, or skills"
            onSearch={handleSearch}
            enterButton
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} lg={8}>
          <Select
            style={{ width: "100%" }}
            placeholder="Filter by job type"
            onChange={handleJobTypeChange}
            defaultValue="all"
            size="large"
          >
            <Option value="all">All Job Types</Option>
            <Option value="remote">Remote</Option>
            <Option value="hybrid">Hybrid</Option>
            <Option value="onsite">Onsite</Option>
          </Select>
        </Col>
      </Row>

      {/* Job Listings */}
      <div className="job-listings">
        <Row gutter={[16, 16]}>
          {filteredJobs.map((job) => (
            <Col xs={24} lg={12} key={job.id}>
              <Card
                className="job-card"
                hoverable
                style={{
                  borderColor: job.borderColor,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div className="job-card-content">
                  <div className="job-card-header">
                    <Avatar
                      src={job.logo}
                      size={72}
                      alt={job.companyName}
                      style={{
                        borderColor: "#91d5ff",
                        borderWidth: "2px",
                        borderStyle: "solid",
                        backgroundColor: "#ffffff",
                        objectFit: "contain",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        padding: "5px",
                        position: "relative",
                      }}
                      imageStyle={{
                        objectFit: "contain",
                        width: "80%",
                        height: "80%",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                    <div className="job-card-title">
                      <Title
                        level={5}
                        style={{ margin: 0, color: job.textColor }}
                      >
                        {job.jobRole}
                      </Title>
                      <Text strong>{job.companyName}</Text>
                      <div className="job-type-badge">
                        <Badge
                          color={getJobTypeBadgeColor(job.jobType)}
                          text={job.jobType}
                        />
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", marginLeft: "8px" }}
                        >
                          Posted {job.postedDate}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  <div className="job-details">
                    <div className="job-detail-item">
                      <EnvironmentOutlined style={{ color: job.textColor }} />
                      <Text>{job.location}</Text>
                    </div>
                    <div className="job-detail-item">
                      <DollarOutlined style={{ color: job.textColor }} />
                      <Text>{job.stipend}</Text>
                    </div>
                    <div className="job-detail-item">
                      <BookOutlined style={{ color: job.textColor }} />
                      <Text>{job.education}</Text>
                    </div>
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ margin: "12px 0" }}
                  >
                    {job.description}
                  </Paragraph>

                  <div className="job-skills">
                    <Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: job.textColor,
                      }}
                    >
                      Required Skills:
                    </Text>
                    <div>
                      {job.skills.map((skill, index) => (
                        <Tag
                          key={index}
                          style={{
                            margin: "0 4px 4px 0",
                            borderColor: job.borderColor,
                            color: job.textColor,
                            background: "white",
                          }}
                        >
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div className="job-actions">
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: job.textColor,
                        borderColor: job.textColor,
                      }}
                    >
                      Apply Now
                    </Button>
                    <Button type="text" icon={<HeartOutlined />}>
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default CandidateDashboardPage;
