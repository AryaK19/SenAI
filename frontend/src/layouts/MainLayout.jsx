import { Layout, Image } from "antd";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";

const { Content, Footer } = Layout;

const MainLayout = () => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavBar />

      <Content
        style={{
          flex: 1,
          padding: "24px 50px",
          overflow: "auto",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            background:
              "linear-gradient(to right,rgb(255, 255, 255),rgb(248, 252, 255),rgb(232, 242, 255))",
            padding: "24px",
            borderRadius: "8px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex-end",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src="/src/assets/logo-lines.png"
              alt="Logo"
              width={120}
              height={60}
              preview={false}
              style={{
                objectFit: "contain"
              }}
            />
          </div>
          <Outlet />
        </div>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          padding: "12px 50px",
          backgroundColor: "#001529",
          color: "white",
          marginTop: "auto",
        }}
      >
        SenAI ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;
