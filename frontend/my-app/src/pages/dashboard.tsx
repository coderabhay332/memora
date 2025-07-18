import { useMeQuery } from "../services/api";
import Content from "../components/Content";
export default function Dashboard() {
  const { data: user } = useMeQuery();
  console.log("User data:", user);

  return (
    <div>
     
      <Content />
    </div>
  );
}
