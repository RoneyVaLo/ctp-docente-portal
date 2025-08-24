import ErrorPage from "../components/ErrorPage";

const AccessDenied = () => {
  return (
    <ErrorPage
      code="403"
      title="Acceso denegado"
      message="No tienes permisos suficientes para acceder a este recurso. Si crees que es un error, contacta con el administrador."
      actions={[
        { to: "/", label: "Volver al inicio" },
        { to: -1, label: "Página anterior", variant: "outline" },
      ]}
    />
  );
};

export default AccessDenied;
