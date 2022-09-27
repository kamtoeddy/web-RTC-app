import useTitle from "../hooks/useTitle";

const NotFound = () => {
  useTitle("404");

  return (
    <div>
      <h1>404</h1>
    </div>
  );
};

export default NotFound;
