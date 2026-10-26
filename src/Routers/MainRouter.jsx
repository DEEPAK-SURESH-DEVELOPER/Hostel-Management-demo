import { Routes, Route } from "react-router-dom";
import GuestRouter from "./GuestRouter";
import AdminRouter from "./AdminRouter";
import OwnerRouter from "./OwnerRouter";
import UserRouter from "./UserRouter";
import ClickSpark from "../Components/ReactBits/ClickSpark/ClickSpark";

const MainRouter = () => {
  return (
    <ClickSpark
      className="click-spark-root"
      sparkColor={["#0F4C5C", "#F4A62A", "#2E8B57"]}
      shape="line"
      sparkCount={8}
      sparkSize={14}
      sparkRadius={30}
      duration={500}
    >
      <Routes>
        <Route path="/*" element={<GuestRouter />} />

        <Route path="/admin/*" element={<AdminRouter />} />

        <Route path="/owner/*" element={<OwnerRouter />} />

        <Route path="/user/*" element={<UserRouter />} />
      </Routes>
    </ClickSpark>
  );
};

export default MainRouter;
