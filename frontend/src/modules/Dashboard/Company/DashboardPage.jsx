import { Card, Row, Col, Statistic } from 'antd';

const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Resumes" value={28} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Shortlisted" value={8} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Review" value={20} />
          </Card>
        </Col>
      </Row>
      {/* More dashboard content will be added later */}
    </div>
  );
};

export default DashboardPage;