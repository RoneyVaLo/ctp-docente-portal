import ErrorPage from "../components/ErrorPage";

const NotFound = () => {
  return (
    <ErrorPage
      code="404"
      title="Página no encontrada"
      message="Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación."
      actions={[
        { to: "/", label: "Volver al inicio" },
        { to: -1, label: "Página anterior", variant: "outline" },
      ]}
    />
  );
};

export default NotFound;
